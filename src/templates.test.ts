import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { copyTemplates, diffTemplates } from './templates.ts';
import { DEFAULT_PATHS, type Config } from './config.ts';
import { useTmpDir } from './test-setup.ts';

const defaultConfig: Config = { paths: { ...DEFAULT_PATHS } };

describe('copyTemplates', () => {
  const tmp = useTmpDir();

  it('copies all template files into target directory', () => {
    const result = copyTemplates(tmp.get(), defaultConfig);

    expect(result.copied).toContain('.claude/skills/tk:brief/SKILL.md');
    expect(result.copied).toContain('.claude/skills/tk:prd/SKILL.md');
    expect(result.copied).toContain('.claude/skills/tk:plan/SKILL.md');
    expect(result.copied).toContain('.claude/skills/tk:check/SKILL.md');
    expect(result.copied).toHaveLength(4);
  });

  it('preserves file contents', () => {
    copyTemplates(tmp.get(), defaultConfig);

    const content = readFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'utf8',
    );
    expect(content).toContain('# PRD Writing');
  });

  it('copies only specified files when only filter is provided', () => {
    const result = copyTemplates(tmp.get(), defaultConfig, [
      '.claude/skills/tk:prd/SKILL.md',
    ]);

    expect(result.copied).toEqual(['.claude/skills/tk:prd/SKILL.md']);
    expect(
      readFileSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'), 'utf8')
        .length,
    ).toBeGreaterThan(0);
  });

  it('creates nested directories as needed', () => {
    copyTemplates(tmp.get(), defaultConfig);

    expect(
      readFileSync(join(tmp.get(), '.claude/skills/tk:plan/SKILL.md'), 'utf8')
        .length,
    ).toBeGreaterThan(0);
  });

  it('substitutes placeholders with default paths', () => {
    copyTemplates(tmp.get(), defaultConfig);

    const content = readFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'utf8',
    );
    expect(content).toContain('.tracerkit/prds/');
    expect(content).not.toContain('{{paths.prds}}');
  });

  it('substitutes placeholders with custom paths', () => {
    const customConfig: Config = {
      paths: { prds: 'docs/prds', plans: 'docs/plans', archives: 'docs/done' },
    };
    copyTemplates(tmp.get(), customConfig);

    const content = readFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'utf8',
    );
    expect(content).toContain('docs/prds/');
    expect(content).not.toContain('{{paths.prds}}');
  });

  it('leaves no unresolved placeholders in any template', () => {
    copyTemplates(tmp.get(), defaultConfig);

    for (const skill of ['tk:brief', 'tk:prd', 'tk:plan', 'tk:check']) {
      const content = readFileSync(
        join(tmp.get(), `.claude/skills/${skill}/SKILL.md`),
        'utf8',
      );
      expect(content).not.toMatch(/\{\{paths\./);
    }
  });
});

describe('diffTemplates', () => {
  const tmp = useTmpDir();

  it('reports all files as missing on empty target', () => {
    const result = diffTemplates(tmp.get(), defaultConfig);

    expect(result.missing).toHaveLength(4);
    expect(result.unchanged).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });

  it('reports all unchanged when files match rendered templates', () => {
    copyTemplates(tmp.get(), defaultConfig);

    const result = diffTemplates(tmp.get(), defaultConfig);
    expect(result.unchanged).toHaveLength(4);
    expect(result.modified).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
  });

  it('detects modified files', () => {
    copyTemplates(tmp.get(), defaultConfig);
    writeFileSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'), 'changed');

    const result = diffTemplates(tmp.get(), defaultConfig);
    expect(result.modified).toContain('.claude/skills/tk:prd/SKILL.md');
    expect(result.unchanged).not.toContain('.claude/skills/tk:prd/SKILL.md');
  });

  it('detects missing files', () => {
    copyTemplates(tmp.get(), defaultConfig);
    rmSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'));

    const result = diffTemplates(tmp.get(), defaultConfig);
    expect(result.missing).toContain('.claude/skills/tk:prd/SKILL.md');
  });

  it('detects config change as modification', () => {
    copyTemplates(tmp.get(), defaultConfig);

    const newConfig: Config = {
      paths: {
        prds: 'custom/prds',
        plans: 'custom/plans',
        archives: 'custom/archives',
      },
    };
    const result = diffTemplates(tmp.get(), newConfig);
    expect(result.modified).toHaveLength(4);
  });
});
