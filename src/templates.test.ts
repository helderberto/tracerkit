import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyTemplates, diffTemplates } from './templates.ts';
import { useTmpDir } from './test-setup.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('copyTemplates', () => {
  const tmp = useTmpDir();

  it('copies all template files into target directory', () => {
    const result = copyTemplates(tmp.get());

    expect(result.copied).toContain('.claude/skills/tk:brief/SKILL.md');
    expect(result.copied).toContain('.claude/skills/tk:prd/SKILL.md');
    expect(result.copied).toContain('.claude/skills/tk:plan/SKILL.md');
    expect(result.copied).toContain('.claude/skills/tk:build/SKILL.md');
    expect(result.copied).toContain('.claude/skills/tk:check/SKILL.md');
    expect(result.copied).toHaveLength(5);
  });

  it('preserves file contents', () => {
    copyTemplates(tmp.get());

    const content = readFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'utf8',
    );
    expect(content).toContain('# PRD Writing');
  });

  it('copies only specified files when only filter is provided', () => {
    const result = copyTemplates(tmp.get(), [
      '.claude/skills/tk:prd/SKILL.md',
    ]);

    expect(result.copied).toEqual(['.claude/skills/tk:prd/SKILL.md']);
    expect(
      readFileSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'), 'utf8')
        .length,
    ).toBeGreaterThan(0);
  });

  it('creates nested directories as needed', () => {
    copyTemplates(tmp.get());

    expect(
      readFileSync(join(tmp.get(), '.claude/skills/tk:plan/SKILL.md'), 'utf8')
        .length,
    ).toBeGreaterThan(0);
  });

  it('copied content matches source exactly', () => {
    copyTemplates(tmp.get());

    for (const skill of [
      'tk:brief',
      'tk:prd',
      'tk:plan',
      'tk:build',
      'tk:check',
    ]) {
      const copied = readFileSync(
        join(tmp.get(), `.claude/skills/${skill}/SKILL.md`),
        'utf8',
      );
      const source = readFileSync(
        join(__dirname, '..', 'skills', skill.replace('tk:', ''), 'SKILL.md'),
        'utf8',
      );
      expect(copied).toBe(source);
    }
  });

  it('contains no conditional blocks', () => {
    copyTemplates(tmp.get());

    for (const skill of [
      'tk:brief',
      'tk:prd',
      'tk:plan',
      'tk:build',
      'tk:check',
    ]) {
      const content = readFileSync(
        join(tmp.get(), `.claude/skills/${skill}/SKILL.md`),
        'utf8',
      );
      expect(content).not.toMatch(/<!-- if:/);
      expect(content).not.toMatch(/<!-- end:/);
    }
  });

  it('contains no github template variables', () => {
    copyTemplates(tmp.get());

    for (const skill of [
      'tk:brief',
      'tk:prd',
      'tk:plan',
      'tk:build',
      'tk:check',
    ]) {
      const content = readFileSync(
        join(tmp.get(), `.claude/skills/${skill}/SKILL.md`),
        'utf8',
      );
      expect(content).not.toMatch(/\{\{github\.labels\./);
    }
  });

  it('contains no config preamble', () => {
    copyTemplates(tmp.get());

    for (const skill of [
      'tk:brief',
      'tk:prd',
      'tk:plan',
      'tk:build',
      'tk:check',
    ]) {
      const content = readFileSync(
        join(tmp.get(), `.claude/skills/${skill}/SKILL.md`),
        'utf8',
      );
      expect(content).not.toMatch(/Config.*config\.json/);
    }
  });
});

describe('diffTemplates', () => {
  const tmp = useTmpDir();

  it('reports all files as missing on empty target', () => {
    const result = diffTemplates(tmp.get());

    expect(result.missing).toHaveLength(5);
    expect(result.unchanged).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });

  it('reports all unchanged when files match source', () => {
    copyTemplates(tmp.get());

    const result = diffTemplates(tmp.get());
    expect(result.unchanged).toHaveLength(5);
    expect(result.modified).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
  });

  it('detects modified files', () => {
    copyTemplates(tmp.get());
    writeFileSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'), 'changed');

    const result = diffTemplates(tmp.get());
    expect(result.modified).toContain('.claude/skills/tk:prd/SKILL.md');
    expect(result.unchanged).not.toContain('.claude/skills/tk:prd/SKILL.md');
  });

  it('detects missing files', () => {
    copyTemplates(tmp.get());
    rmSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'));

    const result = diffTemplates(tmp.get());
    expect(result.missing).toContain('.claude/skills/tk:prd/SKILL.md');
  });
});
