import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { copyTemplates, diffTemplates, renderTemplate } from './templates.ts';
import { DEFAULT_PATHS, DEFAULT_GITHUB, type Config } from './config.ts';
import { useTmpDir } from './test-setup.ts';

const defaultConfig: Config = {
  storage: 'local',
  paths: { ...DEFAULT_PATHS },
  github: { ...DEFAULT_GITHUB },
};

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
      storage: 'local',
      paths: { prds: 'docs/prds', plans: 'docs/plans', archives: 'docs/done' },
      github: { ...DEFAULT_GITHUB },
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

  it('strips github blocks when storage is local', () => {
    copyTemplates(tmp.get(), defaultConfig);

    const content = readFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'utf8',
    );

    expect(content).not.toContain('<!-- if:github -->');
    expect(content).not.toContain('<!-- end:github -->');
    expect(content).not.toContain('<!-- if:local -->');
    expect(content).not.toContain('<!-- end:local -->');
    expect(content).not.toContain('{{github.labels.');
  });

  it('renders github skills with no unresolved placeholders', () => {
    const ghConfig: Config = {
      storage: 'github',
      paths: { ...DEFAULT_PATHS },
      github: {
        repo: 'org/repo',
        labels: { prd: 'tk:prd', plan: 'tk:plan' },
      },
    };
    copyTemplates(tmp.get(), ghConfig);

    for (const skill of ['tk:brief', 'tk:prd', 'tk:plan', 'tk:check']) {
      const content = readFileSync(
        join(tmp.get(), `.claude/skills/${skill}/SKILL.md`),
        'utf8',
      );

      expect(content).not.toContain('<!-- if:github -->');
      expect(content).not.toContain('<!-- if:local -->');
      expect(content).not.toMatch(/\{\{github\.labels\./);
      expect(content).not.toMatch(/\{\{github\.repo/);
    }
  });

  it('github skills contain issue creation instructions', () => {
    const ghConfig: Config = {
      storage: 'github',
      paths: { ...DEFAULT_PATHS },
      github: {
        repo: 'org/repo',
        labels: { prd: 'tk:prd', plan: 'tk:plan' },
      },
    };
    copyTemplates(tmp.get(), ghConfig);

    const prd = readFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'utf8',
    );
    expect(prd).toContain('GitHub Issue');
    expect(prd).toContain('tk:prd');
    expect(prd).not.toContain('.tracerkit/prds/<slug>.md');
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
      storage: 'local',
      paths: {
        prds: 'custom/prds',
        plans: 'custom/plans',
        archives: 'custom/archives',
      },
      github: { ...DEFAULT_GITHUB },
    };
    const result = diffTemplates(tmp.get(), newConfig);
    expect(result.modified).toHaveLength(4);
  });
});

describe('renderTemplate', () => {
  it('strips github blocks when storage is local', () => {
    const input = [
      'before',
      '<!-- if:local -->',
      'local content',
      '<!-- end:local -->',
      '<!-- if:github -->',
      'github content',
      '<!-- end:github -->',
      'after',
    ].join('\n');

    const result = renderTemplate(input, defaultConfig);

    expect(result).toContain('local content');
    expect(result).not.toContain('github content');
    expect(result).toContain('before');
    expect(result).toContain('after');
  });

  it('strips local blocks when storage is github', () => {
    const ghConfig: Config = {
      storage: 'github',
      paths: { ...DEFAULT_PATHS },
      github: { ...DEFAULT_GITHUB },
    };
    const input = [
      '<!-- if:local -->',
      'local content',
      '<!-- end:local -->',
      '<!-- if:github -->',
      'github content',
      '<!-- end:github -->',
    ].join('\n');

    const result = renderTemplate(input, ghConfig);

    expect(result).not.toContain('local content');
    expect(result).toContain('github content');
  });

  it('removes conditional markers from active blocks', () => {
    const input = [
      '<!-- if:local -->',
      'local content',
      '<!-- end:local -->',
    ].join('\n');

    const result = renderTemplate(input, defaultConfig);

    expect(result).not.toContain('<!-- if:local -->');
    expect(result).not.toContain('<!-- end:local -->');
    expect(result).toContain('local content');
  });

  it('injects github.labels template vars', () => {
    const ghConfig: Config = {
      storage: 'github',
      paths: { ...DEFAULT_PATHS },
      github: { labels: { prd: 'custom:prd', plan: 'custom:plan' } },
    };
    const input = 'label: {{github.labels.prd}} and {{github.labels.plan}}';

    const result = renderTemplate(input, ghConfig);

    expect(result).toBe('label: custom:prd and custom:plan');
  });

  it('injects github.repo template var', () => {
    const ghConfig: Config = {
      storage: 'github',
      paths: { ...DEFAULT_PATHS },
      github: { repo: 'org/repo', labels: { prd: 'tk:prd', plan: 'tk:plan' } },
    };
    const input = 'repo: {{github.repo}}';

    const result = renderTemplate(input, ghConfig);

    expect(result).toBe('repo: org/repo');
  });

  it('leaves unresolved github vars when no value set', () => {
    const input = 'repo: {{github.repo}}';

    const result = renderTemplate(input, defaultConfig);

    expect(result).toBe('repo: {{github.repo}}');
  });

  it('handles trailing whitespace after conditional tags', () => {
    const input = [
      '<!-- if:local -->  ',
      'local content',
      '<!-- end:local -->  ',
      '<!-- if:github -->  ',
      'github content',
      '<!-- end:github -->  ',
    ].join('\n');

    const result = renderTemplate(input, defaultConfig);

    expect(result).toContain('local content');
    expect(result).not.toContain('github content');
    expect(result).not.toContain('<!-- if');
    expect(result).not.toContain('<!-- end');
  });

  it('handles multiple conditional blocks', () => {
    const input = [
      '<!-- if:local -->',
      'A',
      '<!-- end:local -->',
      'shared',
      '<!-- if:local -->',
      'B',
      '<!-- end:local -->',
    ].join('\n');

    const result = renderTemplate(input, defaultConfig);

    expect(result).toContain('A');
    expect(result).toContain('shared');
    expect(result).toContain('B');
  });
});
