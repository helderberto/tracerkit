import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { copyTemplates, diffTemplates } from './templates.ts';
import { useTmpDir } from './test-setup.ts';

describe('copyTemplates', () => {
  const tmp = useTmpDir();

  it('copies all template files into target directory', () => {
    const result = copyTemplates(tmp.get());

    expect(result.copied).toContain('.claude/skills/tk:prd/SKILL.md');
    expect(result.copied).toContain('.claude/skills/tk:plan/SKILL.md');
    expect(result.copied).toContain('.claude/skills/tk:verify/SKILL.md');
    expect(result.copied).toHaveLength(3);
  });

  it('preserves file contents', () => {
    copyTemplates(tmp.get());

    const content = readFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'utf8',
    );
    expect(content).toContain('# PRD Writing');
  });

  it('creates nested directories as needed', () => {
    copyTemplates(tmp.get());

    expect(
      readFileSync(join(tmp.get(), '.claude/skills/tk:plan/SKILL.md'), 'utf8')
        .length,
    ).toBeGreaterThan(0);
  });
});

describe('diffTemplates', () => {
  const tmp = useTmpDir();

  it('reports all unchanged when files match templates', () => {
    copyTemplates(tmp.get());

    const result = diffTemplates(tmp.get());
    expect(result.unchanged).toHaveLength(3);
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
