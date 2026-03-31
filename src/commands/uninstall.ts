import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { SKILL_NAMES } from '../templates.ts';

export function uninstall(cwd: string): string[] {
  const hasAny = SKILL_NAMES.some((name) =>
    existsSync(join(cwd, '.claude', 'skills', name)),
  );
  if (!hasAny) {
    throw new Error('TracerKit not initialized — nothing to uninstall');
  }

  const output: string[] = [];

  for (const name of SKILL_NAMES) {
    const target = join(cwd, '.claude', 'skills', name);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
      output.push(`✗ .claude/skills/${name}/ removed`);
    }
  }

  return output;
}
