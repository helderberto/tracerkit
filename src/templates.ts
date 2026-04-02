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
import { type Config } from './config.ts';

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
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

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

function renderTemplate(content: string, config: Config): string {
  return content
    .replaceAll('{{paths.prds}}', config.paths.prds)
    .replaceAll('{{paths.plans}}', config.paths.plans)
    .replaceAll('{{paths.archives}}', config.paths.archives);
}

export function copyTemplates(
  targetDir: string,
  config: Config,
  only?: string[],
): CopyResult {
  const files = only ?? walk(TEMPLATES_DIR);
  for (const rel of files) {
    const src = join(TEMPLATES_DIR, rel);
    const dest = join(targetDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, renderTemplate(readFileSync(src, 'utf8'), config));
  }
  return { copied: files };
}

function hash(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

export function diffTemplates(targetDir: string, config: Config): DiffResult {
  const files = walk(TEMPLATES_DIR);
  const unchanged: string[] = [];
  const modified: string[] = [];
  const missing: string[] = [];

  for (const rel of files) {
    const dest = join(targetDir, rel);
    if (!existsSync(dest)) {
      missing.push(rel);
    } else {
      const rendered = renderTemplate(
        readFileSync(join(TEMPLATES_DIR, rel), 'utf8'),
        config,
      );
      const srcHash = hash(Buffer.from(rendered));
      const destHash = hash(readFileSync(dest));
      if (srcHash === destHash) unchanged.push(rel);
      else modified.push(rel);
    }
  }

  return { unchanged, modified, missing };
}
