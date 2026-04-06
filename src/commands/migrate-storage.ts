import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import {
  loadConfig,
  saveConfig,
  STORAGE_LOCAL,
  STORAGE_GITHUB,
  type Config,
} from '../config.ts';

export type RunGh = (args: string[]) => string;

interface MigrateOptions {
  runGh?: RunGh;
}

interface LocalArtifact {
  slug: string;
  type: 'prd' | 'plan';
  metadata: Record<string, string>;
  body: string;
  title: string;
}

const STATUS_MAP: Record<string, string> = {
  created: 'tk:created',
  in_progress: 'tk:in-progress',
  done: 'tk:done',
};

const LABEL_MAP: Record<string, string> = {
  'tk:created': 'created',
  'tk:in-progress': 'in_progress',
  'tk:done': 'done',
};

export function parseFrontmatter(content: string): {
  metadata: Record<string, string>;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, body: content };

  const metadata: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) metadata[key] = value;
  }

  return { metadata, body: match[2] };
}

export function frontmatterToMetadata(
  metadata: Record<string, string>,
): string {
  const entries = Object.entries(metadata);
  if (entries.length === 0) return '<!-- tk:metadata\n-->';
  const lines = entries.map(([k, v]) => `${k}: ${v}`);
  return `<!-- tk:metadata\n${lines.join('\n')}\n-->`;
}

export function statusToLabel(status: string): string {
  return STATUS_MAP[status] ?? 'tk:created';
}

export function labelToStatus(label: string): string {
  return LABEL_MAP[label] ?? 'created';
}

export function parseMetadata(content: string): {
  metadata: Record<string, string>;
  body: string;
} {
  const match = content.match(/<!--\s*tk:metadata\n([\s\S]*?)-->\n*([\s\S]*)$/);
  if (!match) return { metadata: {}, body: content };

  const metadata: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) metadata[key] = value;
  }

  return { metadata, body: match[2] };
}

export function metadataToFrontmatter(
  metadata: Record<string, string>,
): string {
  const entries = Object.entries(metadata);
  if (entries.length === 0) return '---\n---\n';
  const lines = entries.map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

export function extractSlugFromTitle(title: string): string | null {
  const match = title.match(/\[[^\]]+\]\s+([^:]+):/);
  return match ? match[1].trim() : null;
}

export function extractTitle(body: string): string {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function discoverLocalArtifacts(cwd: string, cfg: Config): LocalArtifact[] {
  const artifacts: LocalArtifact[] = [];

  const prdsDir = join(cwd, cfg.paths.prds);
  if (existsSync(prdsDir)) {
    for (const file of readdirSync(prdsDir)) {
      if (!file.endsWith('.md')) continue;
      const slug = basename(file, '.md');
      const content = readFileSync(join(prdsDir, file), 'utf8');
      const { metadata, body } = parseFrontmatter(content);
      artifacts.push({
        slug,
        type: 'prd',
        metadata,
        body,
        title: extractTitle(body),
      });
    }
  }

  const plansDir = join(cwd, cfg.paths.plans);
  if (existsSync(plansDir)) {
    for (const file of readdirSync(plansDir)) {
      if (!file.endsWith('.md')) continue;
      const slug = basename(file, '.md');
      const content = readFileSync(join(plansDir, file), 'utf8');
      const { metadata, body } = parseFrontmatter(content);
      artifacts.push({
        slug,
        type: 'plan',
        metadata,
        body,
        title: extractTitle(body || content),
      });
    }
  }

  return artifacts;
}

export function classifyGhError(err: unknown): Error {
  const error = err as { code?: string; stderr?: string; message?: string };
  if (error.code === 'ENOENT') {
    return new Error('gh CLI not found — install it: https://cli.github.com');
  }
  const stderr = (error.stderr ?? error.message ?? '').toLowerCase();
  if (stderr.includes('not logged in') || stderr.includes('authentication')) {
    return new Error('Not authenticated with GitHub. Run: gh auth login');
  }
  if (stderr.includes('rate limit') || stderr.includes('403')) {
    return new Error('GitHub rate limit exceeded. Wait and retry.');
  }
  if (stderr.includes('not found') || stderr.includes('404')) {
    return new Error(
      'Repository not found. Check github.repo in .tracerkit/config.json',
    );
  }
  return err instanceof Error ? err : new Error(String(err));
}

function defaultRunGh(args: string[]): string {
  try {
    return execSync(
      `gh ${args.map((a) => `'${a.replace(/'/g, "'\\''")}'`).join(' ')}`,
      {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    ).trim();
  } catch (err: unknown) {
    throw classifyGhError(err);
  }
}

function resolveRepo(cfg: Config, runGh: RunGh): string {
  if (cfg.github.repo) return cfg.github.repo;
  return runGh([
    'repo',
    'view',
    '--json',
    'nameWithOwner',
    '-q',
    '.nameWithOwner',
  ]);
}

interface ExistingIssue {
  number: number;
  title: string;
  body?: string;
  labels: { name: string }[];
  state: string;
}

function fetchExistingIssues(
  repo: string,
  label: string,
  runGh: RunGh,
): ExistingIssue[] {
  const json = runGh([
    'issue',
    'list',
    '--repo',
    repo,
    '--label',
    label,
    '--state',
    'all',
    '--json',
    'number,title,body,labels,state',
    '--limit',
    '1000',
  ]);
  return JSON.parse(json || '[]');
}

function issueExistsForSlug(slug: string, existing: ExistingIssue[]): boolean {
  return existing.some((issue) => {
    if (issue.body) {
      const { metadata } = parseMetadata(issue.body);
      if (metadata.slug) return metadata.slug === slug;
    }
    return extractSlugFromTitle(issue.title) === slug;
  });
}

function ensureLabels(repo: string, labels: string[], runGh: RunGh): void {
  for (const label of labels) {
    runGh(['label', 'create', label, '--repo', repo, '--force']);
  }
}

function createIssue(
  repo: string,
  opts: { title: string; body: string; labels: string[] },
  runGh: RunGh,
): number {
  const args = [
    'issue',
    'create',
    '--repo',
    repo,
    '--title',
    opts.title,
    '--body',
    opts.body,
  ];
  for (const label of opts.labels) {
    args.push('--label', label);
  }
  const url = runGh(args);
  const match = url.match(/\/(\d+)\s*$/);
  return match ? parseInt(match[1], 10) : 0;
}

function closeIssue(repo: string, issueNumber: number, runGh: RunGh): void {
  runGh(['issue', 'close', String(issueNumber), '--repo', repo]);
}

function searchMergedPrs(
  repo: string,
  slug: string,
  runGh: RunGh,
): { number: number; title: string }[] {
  const json = runGh([
    'pr',
    'list',
    '--repo',
    repo,
    '--search',
    slug,
    '--state',
    'merged',
    '--json',
    'number,title',
    '--limit',
    '5',
  ]);
  return JSON.parse(json || '[]');
}

function addIssueComment(
  repo: string,
  issueNumber: number,
  body: string,
  runGh: RunGh,
): void {
  runGh([
    'issue',
    'comment',
    String(issueNumber),
    '--repo',
    repo,
    '--body',
    body,
  ]);
}

function statusFromLabels(labels: string[]): string {
  for (const label of labels) {
    const status = LABEL_MAP[label];
    if (status) return status;
  }
  return 'created';
}

function writeLocalFile(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

export function migrateStorage(cwd: string, opts?: MigrateOptions): string[] {
  const runGh = opts?.runGh ?? defaultRunGh;
  const cfg = loadConfig(cwd);

  if (cfg.storage === STORAGE_LOCAL) {
    return migrateLocalToGitHub(cwd, cfg, runGh);
  }
  return migrateGitHubToLocal(cwd, cfg, runGh);
}

function migrateLocalToGitHub(
  cwd: string,
  cfg: Config,
  runGh: RunGh,
): string[] {
  const output: string[] = [];
  const repo = resolveRepo(cfg, runGh);
  const artifacts = discoverLocalArtifacts(cwd, cfg);

  if (artifacts.length === 0) {
    saveConfig(cwd, { storage: STORAGE_GITHUB });
    output.push('No artifacts found — nothing to migrate.');
    output.push(`✓ Storage switched to "${STORAGE_GITHUB}".`);
    return output;
  }

  const prdLabel = cfg.github.labels?.prd ?? 'tk:prd';
  const planLabel = cfg.github.labels?.plan ?? 'tk:plan';
  const statusLabels = [
    ...new Set(
      artifacts.map((a) => statusToLabel(a.metadata.status ?? 'created')),
    ),
  ];
  ensureLabels(repo, [prdLabel, planLabel, ...statusLabels], runGh);

  const existingPrds = fetchExistingIssues(repo, prdLabel, runGh);
  const existingPlans = fetchExistingIssues(repo, planLabel, runGh);

  for (const artifact of artifacts) {
    const typeLabel = artifact.type === 'prd' ? prdLabel : planLabel;
    const existing = artifact.type === 'prd' ? existingPrds : existingPlans;

    if (issueExistsForSlug(artifact.slug, existing)) {
      output.push(
        `⚠ skip ${artifact.type} "${artifact.slug}" — already exists on GitHub`,
      );
      continue;
    }

    const status = artifact.metadata.status ?? 'created';
    const sLabel = statusToLabel(status);
    const metadataBlock = frontmatterToMetadata(artifact.metadata);
    const body = `${metadataBlock}\n\n${artifact.body.replace(/^\n/, '')}`;
    const title = `[${typeLabel}] ${artifact.slug}: ${artifact.title}`;

    const issueNumber = createIssue(
      repo,
      { title, body, labels: [typeLabel, sLabel] },
      runGh,
    );

    if (status === 'done') {
      closeIssue(repo, issueNumber, runGh);
      linkPrToIssue(repo, artifact.slug, issueNumber, runGh);
      output.push(
        `✓ ${artifact.type} "${artifact.slug}" → issue #${issueNumber} (closed)`,
      );
    } else {
      output.push(
        `✓ ${artifact.type} "${artifact.slug}" → issue #${issueNumber}`,
      );
    }
  }

  saveConfig(cwd, { storage: STORAGE_GITHUB });
  output.push(`✓ Storage switched to "${STORAGE_GITHUB}".`);
  return output;
}

function linkPrToIssue(
  repo: string,
  slug: string,
  issueNumber: number,
  runGh: RunGh,
): void {
  const prs = searchMergedPrs(repo, slug, runGh);
  if (prs.length === 0) return;
  const refs = prs.map((pr) => `#${pr.number}`).join(', ');
  addIssueComment(repo, issueNumber, `Linked PR: ${refs}`, runGh);
}

function migrateGitHubToLocal(
  cwd: string,
  cfg: Config,
  runGh: RunGh,
): string[] {
  const output: string[] = [];
  const repo = resolveRepo(cfg, runGh);
  const prdLabel = cfg.github.labels?.prd ?? 'tk:prd';
  const planLabel = cfg.github.labels?.plan ?? 'tk:plan';

  const prdIssues = fetchExistingIssues(repo, prdLabel, runGh);
  const planIssues = fetchExistingIssues(repo, planLabel, runGh);
  const allIssues = [
    ...prdIssues.map((i) => ({ ...i, type: 'prd' as const })),
    ...planIssues.map((i) => ({ ...i, type: 'plan' as const })),
  ];

  if (allIssues.length === 0) {
    saveConfig(cwd, { storage: STORAGE_LOCAL });
    output.push('No GitHub issues found — nothing to migrate.');
    output.push(`✓ Storage switched to "${STORAGE_LOCAL}".`);
    return output;
  }

  for (const issue of allIssues) {
    const slug = extractSlugFromTitle(issue.title);
    if (!slug) continue;

    const labels = issue.labels.map((l) => l.name);
    const { metadata, body } = parseMetadata(issue.body ?? '');

    const status = metadata.status ?? statusFromLabels(labels);

    const dir = issue.type === 'prd' ? cfg.paths.prds : cfg.paths.plans;
    const filePath = join(cwd, dir, `${slug}.md`);

    if (existsSync(filePath)) {
      output.push(`⚠ skip ${issue.type} "${slug}" — local file already exists`);
      continue;
    }

    if (issue.type === 'prd') {
      const fm = metadataToFrontmatter({ ...metadata, status });
      writeLocalFile(filePath, `${fm}\n${body}`);
    } else {
      const planMeta: Record<string, string> = {};
      if (metadata.source_prd) planMeta.source_prd = metadata.source_prd;
      if (metadata.slug || slug) planMeta.slug = metadata.slug ?? slug;
      if (status) planMeta.status = status;
      const fm = metadataToFrontmatter(planMeta);
      writeLocalFile(filePath, `${fm}\n${body}`);
    }
    output.push(`✓ ${issue.type} "${slug}" → ${filePath}`);
  }

  saveConfig(cwd, { storage: STORAGE_LOCAL });
  output.push(`✓ Storage switched to "${STORAGE_LOCAL}".`);
  return output;
}
