import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { run, resolveTarget } from './cli.ts';
import { copyTemplates } from './templates.ts';
import { useTmpDir } from './test-setup.ts';

describe('resolveTarget', () => {
  it('defaults to cwd when no args', () => {
    expect(resolveTarget([])).toBe(process.cwd());
  });

  it('returns homedir for --global', () => {
    expect(resolveTarget(['--global'])).toBe(homedir());
  });

  it('resolves a path argument', () => {
    expect(resolveTarget(['/some/path'])).toBe('/some/path');
  });

  it('resolves a relative path argument', () => {
    expect(resolveTarget(['./foo'])).toBe(resolve('./foo'));
  });

  it('throws when --global and path are combined', () => {
    expect(() => resolveTarget(['--global', '/some/path'])).toThrow(
      /Cannot use --global with a path argument/,
    );
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

  it('shows --global in usage', () => {
    const output = run([]);

    expect(output.some((l) => l.includes('--global'))).toBe(true);
  });

  it('routes "update <path>" to update command', () => {
    copyTemplates(tmp.get());
    const output = run(['update', tmp.get()]);

    expect(output.some((l) => l.startsWith('✓'))).toBe(true);
    expect(output.some((l) => l.includes('Updated to tracerkit/'))).toBe(true);
    expect(output.some((l) => l.includes('restart your session'))).toBe(true);
  });

  it('routes "uninstall <path>" to uninstall command', () => {
    copyTemplates(tmp.get());
    const output = run(['uninstall', tmp.get()]);

    expect(existsSync(join(tmp.get(), '.claude/skills/tk:prd'))).toBe(false);
    expect(output.some((l) => l.includes('✗'))).toBe(true);
  });

  it('prints version for --version', () => {
    const output = run(['--version']);

    expect(output[0]).toMatch(/^tracerkit\/\d+\.\d+\.\d+/);
  });

  it('prints version for -v', () => {
    const output = run(['-v']);

    expect(output[0]).toMatch(/^tracerkit\/\d+\.\d+\.\d+/);
  });

  it('errors when --global combined with path', () => {
    expect(() => run(['init', '--global', tmp.get()])).toThrow(
      /Cannot use --global with a path argument/,
    );
  });
});
