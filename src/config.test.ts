import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig, DEFAULT_PATHS } from './config.ts';
import { useTmpDir } from './test-setup.ts';

describe('loadConfig', () => {
  const tmp = useTmpDir();

  it('returns all defaults when no config file exists', () => {
    const config = loadConfig(tmp.get());

    expect(config.paths).toEqual(DEFAULT_PATHS);
  });

  it('merges partial config with defaults', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({ paths: { prds: 'docs/prds' } }),
    );

    const config = loadConfig(tmp.get());

    expect(config.paths.prds).toBe('docs/prds');
    expect(config.paths.plans).toBe(DEFAULT_PATHS.plans);
    expect(config.paths.archives).toBe(DEFAULT_PATHS.archives);
  });

  it('overrides all paths when fully specified', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({
        paths: { prds: 'a', plans: 'b', archives: 'c' },
      }),
    );

    const config = loadConfig(tmp.get());

    expect(config.paths).toEqual({ prds: 'a', plans: 'b', archives: 'c' });
  });

  it('throws on invalid JSON', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'config.json'), '{bad json');

    expect(() => loadConfig(tmp.get())).toThrow(
      /Invalid .tracerkit\/config.json/,
    );
  });

  it('ignores unknown keys', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({ paths: { prds: 'x' }, extra: true }),
    );

    const config = loadConfig(tmp.get());

    expect(config.paths.prds).toBe('x');
    expect(config.paths.plans).toBe(DEFAULT_PATHS.plans);
    expect('extra' in config).toBe(false);
  });
});
