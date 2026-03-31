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

  it('skips modified files with warning', () => {
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
