import { writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { update } from './update.ts';
import { copyTemplates } from '../templates.ts';
import { useTmpDir } from '../test-setup.ts';

describe('update', () => {
  const tmp = useTmpDir();

  it('aborts if not initialized', () => {
    expect(() => update(tmp.get())).toThrow(/not initialized/);
  });

  it('overwrites unchanged files', () => {
    copyTemplates(tmp.get());
    const before = readFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'utf8',
    );

    const output = update(tmp.get());

    const after = readFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'utf8',
    );
    expect(after).toBe(before);
    expect(output.some((l) => l.startsWith('✓'))).toBe(true);
  });

  it('skips modified files with warning and suggests --force', () => {
    copyTemplates(tmp.get());
    writeFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'user modified',
    );

    const output = update(tmp.get());

    expect(
      readFileSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'), 'utf8'),
    ).toBe('user modified');
    expect(output.some((l) => l.includes('⚠') && l.includes('tk:prd'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('--force'))).toBe(true);
  });

  it('overwrites modified files when force is true', () => {
    copyTemplates(tmp.get());
    writeFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'user modified',
    );

    const output = update(tmp.get(), { force: true });

    expect(
      readFileSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'), 'utf8'),
    ).not.toBe('user modified');
    expect(output.some((l) => l.includes('✓') && l.includes('tk:prd'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('--force'))).toBe(false);
  });

  it('reports all files as unchanged when nothing changed', () => {
    copyTemplates(tmp.get());

    const output = update(tmp.get());

    expect(output.every((l) => !l.includes('⚠'))).toBe(true);
    expect(output.filter((l) => l.startsWith('✓'))).toHaveLength(4);
  });

  it('outputs only warnings when all files are modified without force', () => {
    copyTemplates(tmp.get());
    for (const name of ['tk:prd', 'tk:plan', 'tk:verify', 'tk:status']) {
      writeFileSync(
        join(tmp.get(), `.claude/skills/${name}/SKILL.md`),
        'modified',
      );
    }

    const output = update(tmp.get());

    expect(output.filter((l) => l.startsWith('✓'))).toHaveLength(0);
    expect(output.filter((l) => l.includes('⚠'))).toHaveLength(4);
  });

  it('adds missing files', () => {
    copyTemplates(tmp.get());
    rmSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'));

    const output = update(tmp.get());

    expect(
      readFileSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'), 'utf8')
        .length,
    ).toBeGreaterThan(0);
    expect(output.some((l) => l.includes('✓') && l.includes('tk:prd'))).toBe(
      true,
    );
  });
});
