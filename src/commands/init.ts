import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '../config.ts';
import { copyTemplates, SKILL_NAMES } from '../templates.ts';
import { update } from './update.ts';

export function init(cwd: string): string[] {
  const hasAny = SKILL_NAMES.some((name) =>
    existsSync(join(cwd, '.claude', 'skills', name)),
  );

  if (hasAny) {
    return update(cwd, { force: false });
  }

  const config = loadConfig(cwd);
  const { copied } = copyTemplates(cwd, config);
  return copied.map((f) => `✓ ${f}`);
}
