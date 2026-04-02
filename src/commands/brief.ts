import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '../config.ts';
import { parseFrontmatter } from '../frontmatter.ts';
import { parsePlan } from '../plan.ts';

interface Feature {
  slug: string;
  status: string;
  created: string;
  progress: string;
  next: string;
}

const UNCHECKED_RE = /^- \[ \] (.+)/;

function formatAge(created: string, now: Date): string {
  const date = new Date(created);
  if (isNaN(date.getTime())) return '';

  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days < 0) return '';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

function firstUnchecked(planContent: string): string {
  for (const line of planContent.split('\n')) {
    const m = line.trimStart().match(UNCHECKED_RE);
    if (m) return m[1].replace(/\s*\[.*?\]\s*$/, '').trim();
  }
  return '—';
}

export function brief(cwd: string, now = new Date()): string[] {
  const config = loadConfig(cwd);
  const prdsDir = join(cwd, config.paths.prds);

  if (!existsSync(prdsDir)) {
    return ['No features found — run `/tk:prd` to start one.'];
  }

  const files = readdirSync(prdsDir)
    .filter((f) => f.endsWith('.md'))
    .sort();
  if (files.length === 0) {
    return ['No features found — run `/tk:prd` to start one.'];
  }

  const plansDir = join(cwd, config.paths.plans);
  const features: Feature[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const prdContent = readFileSync(join(prdsDir, file), 'utf8');
    const fm = parseFrontmatter(prdContent);

    if (fm.status === 'done') continue;

    const status = fm.status || 'unknown';
    const raw = fm.created || '';
    const created = raw && !isNaN(new Date(raw).getTime()) ? raw : '';

    let progress = '—';
    let next = '—';

    const planPath = join(plansDir, `${slug}.md`);
    if (existsSync(planPath)) {
      const planContent = readFileSync(planPath, 'utf8');
      const { phases } = parsePlan(planContent);
      const checked = phases.reduce((s, p) => s + p.checked, 0);
      const total = phases.reduce((s, p) => s + p.total, 0);
      if (total > 0) progress = `${checked}/${total}`;
      next = firstUnchecked(planContent);
    }

    features.push({ slug, status, created, progress, next });
  }

  if (features.length === 0) {
    return ['No features found — run `/tk:prd` to start one.'];
  }

  // Build table
  const header = '| Feature | Status | Age | Progress | Next |';
  const divider = '|---------|--------|-----|----------|------|';

  // Sort features: by created date ascending, no-date last
  features.sort((a, b) => {
    if (a.created && b.created)
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    if (a.created) return -1;
    if (b.created) return 1;
    return 0;
  });

  const rows = features.map((f) => {
    const age = f.created ? formatAge(f.created, now) : '';
    return `| ${f.slug} | ${f.status} | ${age} | ${f.progress} | ${f.next} |`;
  });

  // Focus: single in_progress → auto; 2+ in_progress → oldest in_progress; 0 → oldest overall
  const inProgress = features.filter((f) => f.status === 'in_progress');
  const focus =
    inProgress.length === 1 ? inProgress[0] : (inProgress[0] ?? features[0]);

  return [header, divider, ...rows, '', `**Focus → ${focus.slug}**`];
}
