import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

export function uninstall(cwd: string): string[] {
  if (!existsSync(join(cwd, '.claude-plugin'))) {
    throw new Error('TracerKit not initialized — nothing to uninstall');
  }

  const output: string[] = [];

  for (const dir of ['.claude-plugin', 'skills']) {
    const target = join(cwd, dir);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
      output.push(`✗ ${dir}/ removed`);
    }
  }

  return output;
}
