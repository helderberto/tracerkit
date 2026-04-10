import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { uninstall } from './uninstall.ts';
import { copyTemplates } from '../templates.ts';
import { useTmpDir } from '../test-setup.ts';

describe('uninstall', () => {
  const tmp = useTmpDir();

  it('aborts if not initialized', () => {
    expect(() => uninstall(tmp.get())).toThrow(/not initialized/);
  });

  it('removes all tk skill directories', () => {
    copyTemplates(tmp.get());

    uninstall(tmp.get());

    expect(existsSync(join(tmp.get(), '.claude/skills/tk:prd'))).toBe(false);
    expect(existsSync(join(tmp.get(), '.claude/skills/tk:plan'))).toBe(false);
    expect(existsSync(join(tmp.get(), '.claude/skills/tk:build'))).toBe(false);
    expect(existsSync(join(tmp.get(), '.claude/skills/tk:check'))).toBe(false);
  });

  it('leaves prds/ and plans/ untouched', () => {
    copyTemplates(tmp.get());
    for (const dir of ['prds', 'plans']) {
      mkdirSync(join(tmp.get(), dir));
      writeFileSync(join(tmp.get(), dir, 'test.md'), 'keep');
    }

    uninstall(tmp.get());

    for (const dir of ['prds', 'plans']) {
      expect(existsSync(join(tmp.get(), dir, 'test.md'))).toBe(true);
    }
  });

  it('removes only installed skills when partially installed', () => {
    mkdirSync(join(tmp.get(), '.claude', 'skills', 'tk:prd'), {
      recursive: true,
    });
    writeFileSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'), 'content');

    const output = uninstall(tmp.get());

    expect(existsSync(join(tmp.get(), '.claude/skills/tk:prd'))).toBe(false);
    expect(output).toHaveLength(1);
    expect(output[0]).toContain('tk:prd');
  });

  it('reports removed directories', () => {
    copyTemplates(tmp.get());

    const output = uninstall(tmp.get());

    expect(output.some((l) => l.includes('✗') && l.includes('tk:prd'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('✗') && l.includes('tk:plan'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('✗') && l.includes('tk:build'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('✗') && l.includes('tk:check'))).toBe(
      true,
    );
  });
});
