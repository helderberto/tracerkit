import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { run } from '#src/cli.js';
import { copyTemplates } from '#src/templates.js';
import { useTmpDir } from '#src/test-setup.js';

describe('CLI', () => {
  const tmp = useTmpDir();

  it('routes "init" to init command', () => {
    const output = run(['init'], tmp.get());

    expect(existsSync(join(tmp.get(), '.claude-plugin/plugin.json'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('plugin.json'))).toBe(true);
  });

  it('prints usage for unknown command', () => {
    const output = run(['foo'], tmp.get());

    expect(output.some((l) => l.includes('Usage'))).toBe(true);
  });

  it('prints usage when no command given', () => {
    const output = run([], tmp.get());

    expect(output.some((l) => l.includes('Usage'))).toBe(true);
  });

  it('routes "update" to update command', () => {
    copyTemplates(tmp.get());
    const output = run(['update'], tmp.get());

    expect(output.some((l) => l.startsWith('✓'))).toBe(true);
  });
});
