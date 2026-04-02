import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '../config.ts';
import { copyTemplates, SKILL_NAMES } from '../templates.ts';

export function init(cwd: string, opts?: { force?: boolean }): string[] {
  const force = opts?.force ?? false;

  if (!force) {
    for (const name of SKILL_NAMES) {
      const dir = join(cwd, '.claude', 'skills', name);
      if (existsSync(dir)) {
        throw new Error(
          `.claude/skills/${name}/ already exists — run \`tracerkit update\` to add new skills, or \`tracerkit init --force\` to replace all skills`,
        );
      }
    }
  }

  const config = loadConfig(cwd);
  const { copied } = copyTemplates(cwd, config);
  return copied.map((f) => `✓ ${f}${force ? ' (replaced)' : ''}`);
}
