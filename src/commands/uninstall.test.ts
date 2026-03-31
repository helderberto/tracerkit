import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { uninstall } from './uninstall.ts';
import { copyTemplates } from '../templates.ts';
import { DEFAULT_PATHS, type Config } from '../config.ts';
import { useTmpDir } from '../test-setup.ts';

const defaultConfig: Config = { paths: { ...DEFAULT_PATHS } };

describe('uninstall', () => {
  const tmp = useTmpDir();

  it('aborts if not initialized', () => {
    expect(() => uninstall(tmp.get())).toThrow(/not initialized/);
  });

  it('removes all tk skill directories', () => {
    copyTemplates(tmp.get(), defaultConfig);

    uninstall(tmp.get());

    expect(existsSync(join(tmp.get(), '.claude/skills/tk:prd'))).toBe(false);
    expect(existsSync(join(tmp.get(), '.claude/skills/tk:plan'))).toBe(false);
    expect(existsSync(join(tmp.get(), '.claude/skills/tk:verify'))).toBe(false);
    expect(existsSync(join(tmp.get(), '.claude/skills/tk:status'))).toBe(false);
  });

  it('leaves prds/, plans/, and archive/ untouched', () => {
    copyTemplates(tmp.get(), defaultConfig);
    for (const dir of ['prds', 'plans', 'archive']) {
      mkdirSync(join(tmp.get(), dir));
      writeFileSync(join(tmp.get(), dir, 'test.md'), 'keep');
    }

    uninstall(tmp.get());

    for (const dir of ['prds', 'plans', 'archive']) {
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
    copyTemplates(tmp.get(), defaultConfig);

    const output = uninstall(tmp.get());

    expect(output.some((l) => l.includes('✗') && l.includes('tk:prd'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('✗') && l.includes('tk:plan'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('✗') && l.includes('tk:verify'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('✗') && l.includes('tk:status'))).toBe(
      true,
    );
  });
});
