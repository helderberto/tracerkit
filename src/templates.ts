import {
  readdirSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type Config,
  DEFAULT_PATHS,
  STORAGE_LOCAL,
  STORAGE_GITHUB,
} from './config.ts';
import { SKILL_PREFIX } from './constants.ts';

export { SKILL_NAMES, DEPRECATED_SKILLS } from './constants.ts';

export interface CopyResult {
  copied: string[];
}

export interface DiffResult {
  unchanged: string[];
  modified: string[];
  missing: string[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, '..', 'skills');

function walk(dir: string, prefix = ''): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) files.push(...walk(join(dir, e.name), rel));
    else files.push(rel);
  }
  return files.sort();
}

function toTargetPath(srcRel: string): string {
  return `.claude/skills/${SKILL_PREFIX}:${srcRel}`;
}

function toSourcePath(targetRel: string): string {
  const prefix = `.claude/skills/${SKILL_PREFIX}:`;
  return targetRel.slice(prefix.length);
}

export function renderTemplate(content: string, config: Config): string {
  let result = content;

  // Path substitutions
  if (config.paths.prds !== DEFAULT_PATHS.prds) {
    result = result.replaceAll(DEFAULT_PATHS.prds, config.paths.prds);
  }
  if (config.paths.plans !== DEFAULT_PATHS.plans) {
    result = result.replaceAll(DEFAULT_PATHS.plans, config.paths.plans);
  }
  if (config.paths.archives !== DEFAULT_PATHS.archives) {
    result = result.replaceAll(DEFAULT_PATHS.archives, config.paths.archives);
  }

  // Conditional blocks: strip inactive storage, unwrap active
  const active = config.storage ?? STORAGE_LOCAL;
  const inactive = active === STORAGE_LOCAL ? STORAGE_GITHUB : STORAGE_LOCAL;

  result = result.replace(
    new RegExp(
      `<!-- if:${inactive} -->[^\\S\\n]*\\n[\\s\\S]*?<!-- end:${inactive} -->[^\\S\\n]*\\n?`,
      'g',
    ),
    '',
  );
  result = result.replace(
    new RegExp(`<!-- if:${active} -->[^\\S\\n]*\\n`, 'g'),
    '',
  );
  result = result.replace(
    new RegExp(`<!-- end:${active} -->[^\\S\\n]*\\n?`, 'g'),
    '',
  );

  // GitHub template variables
  if (config.github?.repo) {
    result = result.replaceAll('{{github.repo}}', config.github.repo);
  }
  if (config.github?.labels?.prd) {
    result = result.replaceAll(
      '{{github.labels.prd}}',
      config.github.labels.prd,
    );
  }
  if (config.github?.labels?.plan) {
    result = result.replaceAll(
      '{{github.labels.plan}}',
      config.github.labels.plan,
    );
  }

  return result;
}

export function copyTemplates(
  targetDir: string,
  config: Config,
  only?: string[],
): CopyResult {
  const targetFiles = only ?? walk(SKILLS_DIR).map(toTargetPath);
  for (const targetRel of targetFiles) {
    const srcRel = toSourcePath(targetRel);
    const src = join(SKILLS_DIR, srcRel);
    const dest = join(targetDir, targetRel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, renderTemplate(readFileSync(src, 'utf8'), config));
  }
  return { copied: targetFiles };
}

function hash(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

export function diffTemplates(targetDir: string, config: Config): DiffResult {
  const targetFiles = walk(SKILLS_DIR).map(toTargetPath);
  const unchanged: string[] = [];
  const modified: string[] = [];
  const missing: string[] = [];

  for (const targetRel of targetFiles) {
    const dest = join(targetDir, targetRel);
    if (!existsSync(dest)) {
      missing.push(targetRel);
    } else {
      const srcRel = toSourcePath(targetRel);
      const rendered = renderTemplate(
        readFileSync(join(SKILLS_DIR, srcRel), 'utf8'),
        config,
      );
      const srcHash = hash(Buffer.from(rendered));
      const destHash = hash(readFileSync(dest));
      if (srcHash === destHash) unchanged.push(targetRel);
      else modified.push(targetRel);
    }
  }

  return { unchanged, modified, missing };
}
