import {
  mkdirSync,
  rmSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { init } from './init.ts';
import { copyTemplates } from '../templates.ts';
import { DEFAULT_PATHS, DEFAULT_GITHUB, type Config } from '../config.ts';
import { useTmpDir } from '../test-setup.ts';

const defaultConfig: Config = {
  storage: 'local',
  paths: { ...DEFAULT_PATHS },
  github: { ...DEFAULT_GITHUB },
};

describe('init', () => {
  const tmp = useTmpDir();

  it('copies all template files into a fresh directory', () => {
    const output = init(tmp.get());

    expect(existsSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'))).toBe(
      true,
    );
    expect(existsSync(join(tmp.get(), '.claude/skills/tk:plan/SKILL.md'))).toBe(
      true,
    );
    expect(
      existsSync(join(tmp.get(), '.claude/skills/tk:check/SKILL.md')),
    ).toBe(true);
    expect(output).toContain('✓ .claude/skills/tk:prd/SKILL.md');
  });

  it('does not throw when skills already exist', () => {
    copyTemplates(tmp.get(), defaultConfig);

    expect(() => init(tmp.get())).not.toThrow();
  });

  it('adds missing skills when partially installed', () => {
    copyTemplates(tmp.get(), defaultConfig);
    rmSync(join(tmp.get(), '.claude', 'skills', 'tk:brief'), {
      recursive: true,
    });

    const output = init(tmp.get());

    expect(
      existsSync(join(tmp.get(), '.claude/skills/tk:brief/SKILL.md')),
    ).toBe(true);
    expect(
      output.some((l) => l.includes('tk:brief') && l.includes('added')),
    ).toBe(true);
  });

  it('preserves existing .claude/ contents', () => {
    mkdirSync(join(tmp.get(), '.claude'), { recursive: true });

    const output = init(tmp.get());

    expect(output.length).toBe(4);
  });

  it('reports each copied file with check prefix', () => {
    const output = init(tmp.get());

    for (const line of output) {
      expect(line).toMatch(/^✓/);
    }
  });

  it('writes config with storage when --storage flag is provided', () => {
    init(tmp.get(), { storage: 'github' });

    const raw = readFileSync(
      join(tmp.get(), '.tracerkit', 'config.json'),
      'utf8',
    );

    expect(JSON.parse(raw).storage).toBe('github');
  });

  it('renders skills with github blocks when storage is github', () => {
    init(tmp.get(), { storage: 'github' });

    const skill = readFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'utf8',
    );

    expect(skill).not.toContain('<!-- if:github -->');
    expect(skill).not.toContain('<!-- if:local -->');
  });

  it('does not force-update when storage matches current', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({ storage: 'github' }),
    );
    init(tmp.get(), { storage: 'github' });

    // User modifies a skill
    const skillPath = join(tmp.get(), '.claude/skills/tk:prd/SKILL.md');
    writeFileSync(skillPath, 'user modified');

    // Re-init with same storage should NOT overwrite
    const output = init(tmp.get(), { storage: 'github' });

    expect(readFileSync(skillPath, 'utf8')).toBe('user modified');
    expect(output.some((l) => l.includes('modified'))).toBe(true);
  });
});
