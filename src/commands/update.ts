import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  copyTemplates,
  diffTemplates,
  SKILL_NAMES,
  DEPRECATED_SKILLS,
} from '../templates.ts';

export function update(cwd: string, opts?: { force?: boolean }): string[] {
  const hasAny = SKILL_NAMES.some((name) =>
    existsSync(join(cwd, '.claude', 'skills', name)),
  );
  if (!hasAny) {
    throw new Error('TracerKit not initialized — run `tracerkit init` first');
  }

  const { unchanged, modified, missing } = diffTemplates(cwd);
  const output: string[] = [];

  for (const name of DEPRECATED_SKILLS) {
    const dir = join(cwd, '.claude', 'skills', name);
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
      output.push(`✗ .claude/skills/${name}/ removed (deprecated)`);
    }
  }

  const force = opts?.force ?? false;
  const toCopy = [...unchanged, ...missing, ...(force ? modified : [])];
  if (toCopy.length > 0) {
    copyTemplates(cwd, toCopy);
    for (const f of unchanged) output.push(`✓ ${f}`);
    for (const f of missing) output.push(`✓ ${f} (added)`);
    if (force) {
      for (const f of modified) output.push(`✓ ${f} (replaced)`);
    }
  }

  if (!force && modified.length > 0) {
    for (const f of modified) output.push(`⚠ ${f} (skipped — modified)`);
    output.push(
      '',
      'Run `tracerkit update --force` to replace modified files with latest versions.',
    );
  }

  return output;
}
