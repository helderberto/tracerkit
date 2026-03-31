import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { copyTemplates } from '#src/templates.js';

export function init(cwd: string): string[] {
  const pluginDir = join(cwd, '.claude-plugin');
  const skillsDir = join(cwd, 'skills');

  if (existsSync(pluginDir)) {
    throw new Error('.claude-plugin/ already exists — aborting');
  }
  if (existsSync(skillsDir)) {
    throw new Error('skills/ already exists — aborting');
  }

  const { copied } = copyTemplates(cwd);
  return copied.map((f) => `✓ ${f}`);
}
