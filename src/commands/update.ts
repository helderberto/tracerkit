import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { copyTemplates, diffTemplates } from '#src/templates.js';

export function update(cwd: string): string[] {
  if (!existsSync(join(cwd, '.claude-plugin'))) {
    throw new Error('TracerKit not initialized — run `tracerkit init` first');
  }

  const { unchanged, modified, missing } = diffTemplates(cwd);
  const output: string[] = [];

  const toCopy = [...unchanged, ...missing];
  if (toCopy.length > 0) {
    copyTemplates(cwd, toCopy);
    for (const f of unchanged) output.push(`✓ ${f}`);
    for (const f of missing) output.push(`✓ ${f} (added)`);
  }

  for (const f of modified) output.push(`⚠ ${f} (skipped — modified)`);

  return output;
}
