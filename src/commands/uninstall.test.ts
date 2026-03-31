import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { uninstall } from '#src/commands/uninstall.js';
import { copyTemplates } from '#src/templates.js';
import { useTmpDir } from '#src/test-setup.js';

describe('uninstall', () => {
  const tmp = useTmpDir();

  it('aborts if not initialized', () => {
    expect(() => uninstall(tmp.get())).toThrow(/not initialized/);
  });

  it('removes .claude-plugin/ and skills/', () => {
    copyTemplates(tmp.get());

    uninstall(tmp.get());

    expect(existsSync(join(tmp.get(), '.claude-plugin'))).toBe(false);
    expect(existsSync(join(tmp.get(), 'skills'))).toBe(false);
  });

  it('leaves prds/, plans/, and archive/ untouched', () => {
    copyTemplates(tmp.get());
    for (const dir of ['prds', 'plans', 'archive']) {
      mkdirSync(join(tmp.get(), dir));
      writeFileSync(join(tmp.get(), dir, 'test.md'), 'keep');
    }

    uninstall(tmp.get());

    for (const dir of ['prds', 'plans', 'archive']) {
      expect(existsSync(join(tmp.get(), dir, 'test.md'))).toBe(true);
    }
  });

  it('reports removed directories', () => {
    copyTemplates(tmp.get());

    const output = uninstall(tmp.get());

    expect(
      output.some((l) => l.includes('✗') && l.includes('.claude-plugin/')),
    ).toBe(true);
    expect(output.some((l) => l.includes('✗') && l.includes('skills/'))).toBe(
      true,
    );
  });
});
