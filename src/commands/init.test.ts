import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { init } from '#src/commands/init.js';
import { useTmpDir } from '#src/test-setup.js';

describe('init', () => {
  const tmp = useTmpDir();

  it('copies all template files into a fresh directory', () => {
    const output = init(tmp.get());

    expect(existsSync(join(tmp.get(), '.claude-plugin/plugin.json'))).toBe(
      true,
    );
    expect(existsSync(join(tmp.get(), 'skills/prd/SKILL.md'))).toBe(true);
    expect(output).toContain('✓ .claude-plugin/plugin.json');
  });

  it('aborts if .claude-plugin/ already exists', () => {
    mkdirSync(join(tmp.get(), '.claude-plugin'));

    expect(() => init(tmp.get())).toThrow(/already exists/);
  });

  it('aborts if skills/ already exists', () => {
    mkdirSync(join(tmp.get(), 'skills'));

    expect(() => init(tmp.get())).toThrow(/already exists/);
  });

  it('reports each copied file with check prefix', () => {
    const output = init(tmp.get());

    for (const line of output) {
      expect(line).toMatch(/^✓/);
    }
  });
});
