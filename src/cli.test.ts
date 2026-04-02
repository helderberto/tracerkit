import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { run, resolveTarget } from './cli.ts';
import { copyTemplates } from './templates.ts';
import { DEFAULT_PATHS, type Config } from './config.ts';
import { useTmpDir } from './test-setup.ts';

const defaultConfig: Config = { paths: { ...DEFAULT_PATHS } };

describe('resolveTarget', () => {
  it('defaults to homedir when no args', () => {
    expect(resolveTarget([])).toBe(homedir());
  });

  it('resolves a path argument', () => {
    expect(resolveTarget(['/some/path'])).toBe('/some/path');
  });

  it('resolves a relative path argument', () => {
    expect(resolveTarget(['./foo'])).toBe(resolve('./foo'));
  });

  it('ignores flag arguments and picks the path', () => {
    expect(resolveTarget(['--force', '/some/path'])).toBe('/some/path');
  });

  it('defaults to homedir when only flags are present', () => {
    expect(resolveTarget(['--force', '--verbose'])).toBe(homedir());
  });
});

describe('CLI', () => {
  const tmp = useTmpDir();

  it('routes "init <path>" to init command', () => {
    const output = run(['init', tmp.get()]);

    expect(existsSync(join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('tk:prd'))).toBe(true);
  });

  it('prints usage for unknown command', () => {
    const output = run(['foo']);

    expect(output.some((l) => l.includes('Usage'))).toBe(true);
  });

  it('prints usage when no command given', () => {
    const output = run([]);

    expect(output.some((l) => l.includes('Usage'))).toBe(true);
  });

  it('prints help for --help', () => {
    const output = run(['--help']);

    expect(output.some((l) => l.includes('Usage'))).toBe(true);
  });

  it('prints help for -h', () => {
    const output = run(['-h']);

    expect(output.some((l) => l.includes('Usage'))).toBe(true);
  });

  it('routes "update <path>" to update command', () => {
    copyTemplates(tmp.get(), defaultConfig);
    const output = run(['update', tmp.get()]);

    expect(output.some((l) => l.startsWith('✓'))).toBe(true);
    expect(
      output.some((l) => l.includes('Updated to the latest TracerKit.')),
    ).toBe(true);
    expect(output.some((l) => l.includes('restart your session'))).toBe(true);
  });

  it('passes --force to update command', () => {
    copyTemplates(tmp.get(), defaultConfig);
    writeFileSync(
      join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
      'user modified',
    );
    const output = run(['update', '--force', tmp.get()]);

    expect(output.some((l) => l.includes('✓') && l.includes('tk:prd'))).toBe(
      true,
    );
    expect(output.some((l) => l.includes('--force'))).toBe(false);
  });

  it('routes "uninstall <path>" to uninstall command', () => {
    copyTemplates(tmp.get(), defaultConfig);
    const output = run(['uninstall', tmp.get()]);

    expect(existsSync(join(tmp.get(), '.claude/skills/tk:prd'))).toBe(false);
    expect(output.some((l) => l.includes('✗'))).toBe(true);
  });

  it('prints version for --version', () => {
    const output = run(['--version']);

    expect(output[0]).toMatch(/^tracerkit\/\d+\.\d+\.\d+/);
  });

  it('prioritizes --help over commands', () => {
    const output = run(['init', '--help']);

    expect(output.some((l) => l.includes('Usage'))).toBe(true);
  });

  it('prioritizes --version over commands', () => {
    const output = run(['init', '--version']);

    expect(output[0]).toMatch(/^tracerkit\/\d+\.\d+\.\d+/);
  });

  it('prints version for -v', () => {
    const output = run(['-v']);

    expect(output[0]).toMatch(/^tracerkit\/\d+\.\d+\.\d+/);
  });

  it('routes "progress <slug>" to progress command', () => {
    const plansDir = join(tmp.get(), '.tracerkit', 'plans');
    mkdirSync(plansDir, { recursive: true });
    writeFileSync(
      join(plansDir, 'feat.md'),
      '## Phase 1 — Setup\n\n- [x] Done\n- [ ] Todo\n',
    );

    const output = run(['progress', 'feat', tmp.get()]);

    expect(output.some((l) => l.includes('1/2'))).toBe(true);
  });

  it('prints error when progress slug missing', () => {
    const output = run(['progress']);

    expect(output[0]).toContain('Error');
    expect(output.some((l) => l.includes('Usage'))).toBe(true);
  });
});
