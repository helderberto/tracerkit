import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { copyTemplates } from '#src/templates.js';
import { useTmpDir } from '#src/test-setup.js';

function listFiles(dir: string, prefix = ''): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) files.push(...listFiles(join(dir, e.name), rel));
    else files.push(rel);
  }
  return files.sort();
}

describe('copyTemplates', () => {
  const tmp = useTmpDir();

  it('copies all template files into target directory', () => {
    const result = copyTemplates(tmp.get());

    expect(result.copied).toContain('.claude-plugin/plugin.json');
    expect(result.copied).toContain('skills/prd/SKILL.md');
    expect(result.copied).toContain('skills/plan/SKILL.md');
    expect(result.copied).toContain('skills/verify/SKILL.md');
    expect(result.copied).toContain('skills/archive/SKILL.md');
    expect(result.copied).toHaveLength(5);
  });

  it('preserves file contents', () => {
    copyTemplates(tmp.get());

    const content = readFileSync(
      join(tmp.get(), '.claude-plugin/plugin.json'),
      'utf8',
    );
    expect(content).toContain('"name": "tk"');
  });

  it('creates nested directories as needed', () => {
    copyTemplates(tmp.get());

    const files = listFiles(tmp.get());
    expect(files).toContain('.claude-plugin/plugin.json');
    expect(files).toContain('skills/prd/SKILL.md');
  });
});
