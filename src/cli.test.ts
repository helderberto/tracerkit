import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './cli.ts';
import { copyTemplates } from './templates.ts';
import { useTmpDir } from './test-setup.ts';

describe('CLI', () => {
  const tmp = useTmpDir();

  it('routes "init" to init command', () => {
    const output = run(['init'], tmp.get());

    expect(existsSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('tk:prd'))).toBe(true);
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

  it('routes "uninstall" to uninstall command', () => {
    copyTemplates(tmp.get());
    const output = run(['uninstall'], tmp.get());

    expect(existsSync(join(tmp.get(), '.claude/skills/tk:prd'))).toBe(false);
    expect(output.some((l) => l.includes('✗'))).toBe(true);
  });
});
