import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { init } from './init.ts';
import { useTmpDir } from '../test-setup.ts';

describe('init', () => {
  const tmp = useTmpDir();

  it('copies all template files into a fresh directory', () => {
    const output = init(tmp.get());

    expect(existsSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'))).toBe(
      true,
    );
    expect(existsSync(join(tmp.get(), '.claude/skills/tk:plan/SKILL.md'))).toBe(
      true,
    );
    expect(
      existsSync(join(tmp.get(), '.claude/skills/tk:check/SKILL.md')),
    ).toBe(true);
    expect(output).toContain('✓ .claude/skills/tk:prd/SKILL.md');
  });

  it('aborts if any tk skill already exists', () => {
    mkdirSync(join(tmp.get(), '.claude', 'skills', 'tk:prd'), {
      recursive: true,
    });

    expect(() => init(tmp.get())).toThrow(/already exists/);
  });

  it('error message suggests tracerkit update and update --force', () => {
    mkdirSync(join(tmp.get(), '.claude', 'skills', 'tk:prd'), {
      recursive: true,
    });

    expect(() => init(tmp.get())).toThrow(/tracerkit update/);
    expect(() => init(tmp.get())).toThrow(/update --force/);
  });

  it('preserves existing .claude/ contents', () => {
    mkdirSync(join(tmp.get(), '.claude'), { recursive: true });

    const output = init(tmp.get());

    expect(output.length).toBe(4);
  });

  it('reports each copied file with check prefix', () => {
    const output = init(tmp.get());

    for (const line of output) {
      expect(line).toMatch(/^✓/);
    }
  });
});
