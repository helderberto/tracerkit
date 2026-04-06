import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig, saveConfig, type Storage } from '../config.ts';
import { copyTemplates, SKILL_NAMES } from '../templates.ts';
import { update } from './update.ts';

interface InitOptions {
  storage?: Storage;
}

export function init(cwd: string, opts?: InitOptions): string[] {
  if (opts?.storage) {
    saveConfig(cwd, { storage: opts.storage });
  }

  const hasAny = SKILL_NAMES.some((name) =>
    existsSync(join(cwd, '.claude', 'skills', name)),
  );

  if (hasAny) {
    return update(cwd, { force: !!opts?.storage });
  }

  const config = loadConfig(cwd);
  const { copied } = copyTemplates(cwd, config);
  return copied.map((f) => `✓ ${f}`);
}
