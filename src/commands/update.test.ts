import {
  writeFileSync,
  readFileSync,
  rmSync,
  mkdirSync,
  existsSync,
} from 'node:fs';
import { join } from 'node:path';
import { update } from './update.ts';
import { copyTemplates, DEPRECATED_SKILLS } from '../templates.ts';
import { DEFAULT_PATHS, type Config } from '../config.ts';
import { useTmpDir } from '../test-setup.ts';

const defaultConfig: Config = {
  storage: 'local',
  paths: { ...DEFAULT_PATHS },
  github: { labels: { prd: 'tk:prd', plan: 'tk:plan' } },
};

describe('update', () => {
  const tmp = useTmpDir();

  it('aborts if not initialized', () => {
    expect(() => update(tmp.get())).toThrow(/not initialized/);
  });

  it('overwrites unchanged files', () => {
    copyTemplates(tmp.get(), defaultConfig);
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
    copyTemplates(tmp.get(), defaultConfig);
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
    copyTemplates(tmp.get(), defaultConfig);
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
    copyTemplates(tmp.get(), defaultConfig);

    const output = update(tmp.get());

    expect(output.every((l) => !l.includes('⚠'))).toBe(true);
    expect(output.filter((l) => l.startsWith('✓'))).toHaveLength(5);
  });

  it('outputs only warnings when all files are modified without force', () => {
    copyTemplates(tmp.get(), defaultConfig);
    for (const name of [
      'tk:brief',
      'tk:prd',
      'tk:plan',
      'tk:build',
      'tk:check',
    ]) {
      writeFileSync(
        join(tmp.get(), `.claude/skills/${name}/SKILL.md`),
        'modified',
      );
    }

    const output = update(tmp.get());

    expect(output.filter((l) => l.startsWith('✓'))).toHaveLength(0);
    expect(output.filter((l) => l.includes('⚠'))).toHaveLength(5);
  });

  it('removes deprecated skills', () => {
    copyTemplates(tmp.get(), defaultConfig);
    for (const name of DEPRECATED_SKILLS) {
      const dir = join(tmp.get(), '.claude', 'skills', name);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'SKILL.md'), 'old');
    }

    const output = update(tmp.get());

    for (const name of DEPRECATED_SKILLS) {
      expect(existsSync(join(tmp.get(), '.claude', 'skills', name))).toBe(
        false,
      );
    }
    expect(
      output.some((l) => l.includes('tk:verify') && l.includes('removed')),
    ).toBe(true);
  });

  it('skips deprecated removal when none exist', () => {
    copyTemplates(tmp.get(), defaultConfig);

    const output = update(tmp.get());

    expect(output.some((l) => l.includes('removed'))).toBe(false);
  });

  it('adds missing files', () => {
    copyTemplates(tmp.get(), defaultConfig);
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
