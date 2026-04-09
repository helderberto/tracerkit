import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  loadConfig,
  saveConfig,
  DEFAULT_PATHS,
  DEFAULT_GITHUB,
} from './config.ts';
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
  });

  it('overrides all paths when fully specified', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({
        paths: { prds: 'a', plans: 'b' },
      }),
    );

    const config = loadConfig(tmp.get());

    expect(config.paths).toEqual({ prds: 'a', plans: 'b' });
  });

  it('throws on invalid JSON', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'config.json'), '{bad json');

    expect(() => loadConfig(tmp.get())).toThrow(
      /Invalid .tracerkit\/config.json/,
    );
  });

  it('falls back to default paths when paths is not an object', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({ paths: 'invalid' }),
    );

    const config = loadConfig(tmp.get());

    expect(config.paths).toEqual(DEFAULT_PATHS);
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

  it('defaults storage to local', () => {
    const config = loadConfig(tmp.get());

    expect(config.storage).toBe('local');
  });

  it('parses storage: github', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({ storage: 'github' }),
    );

    const config = loadConfig(tmp.get());

    expect(config.storage).toBe('github');
  });

  it('defaults github to DEFAULT_GITHUB when storage is github', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({ storage: 'github' }),
    );

    const config = loadConfig(tmp.get());

    expect(config.github).toEqual(DEFAULT_GITHUB);
  });

  it('parses partial github config with custom prd label', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({
        storage: 'github',
        github: { labels: { prd: 'custom:prd' } },
      }),
    );

    const config = loadConfig(tmp.get());

    expect(config.github.labels?.prd).toBe('custom:prd');
    expect(config.github.labels?.plan).toBe(DEFAULT_GITHUB.labels.plan);
  });

  it('parses full github config', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({
        storage: 'github',
        github: {
          labels: { prd: 'custom:prd', plan: 'custom:plan' },
        },
      }),
    );

    const config = loadConfig(tmp.get());

    expect(config.github).toEqual({
      labels: { prd: 'custom:prd', plan: 'custom:plan' },
    });
  });

  it('ignores invalid storage value and defaults to local', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({ storage: 'jira' }),
    );

    const config = loadConfig(tmp.get());

    expect(config.storage).toBe('local');
  });
});

describe('saveConfig', () => {
  const tmp = useTmpDir();

  it('writes config to .tracerkit/config.json', () => {
    saveConfig(tmp.get(), { storage: 'github' });

    const raw = readFileSync(
      join(tmp.get(), '.tracerkit', 'config.json'),
      'utf8',
    );
    const parsed = JSON.parse(raw);

    expect(parsed.storage).toBe('github');
  });

  it('merges with existing config', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({ paths: { prds: 'custom/prds' } }),
    );

    saveConfig(tmp.get(), { storage: 'github' });

    const raw = readFileSync(join(dir, 'config.json'), 'utf8');
    const parsed = JSON.parse(raw);

    expect(parsed.storage).toBe('github');
    expect(parsed.paths.prds).toBe('custom/prds');
  });

  it('creates .tracerkit/ if missing', () => {
    saveConfig(tmp.get(), { storage: 'github' });

    const raw = readFileSync(
      join(tmp.get(), '.tracerkit', 'config.json'),
      'utf8',
    );

    expect(JSON.parse(raw).storage).toBe('github');
  });

  it('overwrites corrupt existing config instead of crashing', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'config.json'), '{bad json');

    saveConfig(tmp.get(), { storage: 'github' });

    const raw = readFileSync(join(dir, 'config.json'), 'utf8');
    const parsed = JSON.parse(raw);

    expect(parsed).toEqual({ storage: 'github' });
  });

  it('deep-merges github config', () => {
    const dir = join(tmp.get(), '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify({
        storage: 'github',
        github: { labels: { plan: 'my:plan' } },
      }),
    );

    saveConfig(tmp.get(), { github: { labels: { prd: 'my:prd' } } });

    const raw = readFileSync(join(dir, 'config.json'), 'utf8');
    const parsed = JSON.parse(raw);

    expect(parsed.github.labels.plan).toBe('my:plan');
    expect(parsed.github.labels.prd).toBe('my:prd');
  });
});
