import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface CopyResult {
  copied: string[];
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

export function copyTemplates(targetDir: string): CopyResult {
  const files = walk(TEMPLATES_DIR);
  for (const rel of files) {
    const src = join(TEMPLATES_DIR, rel);
    const dest = join(targetDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(src));
  }
  return { copied: files };
}
