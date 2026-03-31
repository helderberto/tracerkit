import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { copyTemplates, SKILL_NAMES } from '../templates.ts';

export function init(cwd: string): string[] {
  for (const name of SKILL_NAMES) {
    const dir = join(cwd, '.claude', 'skills', name);
    if (existsSync(dir)) {
      throw new Error(`.claude/skills/${name}/ already exists — aborting`);
    }
  }

  const { copied } = copyTemplates(cwd);
  return copied.map((f) => `✓ ${f}`);
}
