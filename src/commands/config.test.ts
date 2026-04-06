import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from './config.ts';
import { DEFAULT_PATHS, DEFAULT_GITHUB, type Config } from '../config.ts';
import { copyTemplates } from '../templates.ts';
import { useTmpDir } from '../test-setup.ts';

const defaultConfig: Config = {
  storage: 'local',
  paths: { ...DEFAULT_PATHS },
  github: { ...DEFAULT_GITHUB },
};

describe('config', () => {
  const tmp = useTmpDir();

  describe('get (no value)', () => {
    it('prints current config as JSON when no args', () => {
      const output = config(tmp.get(), []);

      expect(output.join('\n')).toContain('"storage"');
      expect(output.join('\n')).toContain('"local"');
    });

    it('omits github from output when storage is local', () => {
      const output = config(tmp.get(), []);

      expect(output.join('\n')).not.toContain('"github"');
    });

    it('includes github in output when storage is github', () => {
      const dir = join(tmp.get(), '.tracerkit');
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, 'config.json'),
        JSON.stringify({ storage: 'github' }),
      );

      const output = config(tmp.get(), []);

      expect(output.join('\n')).toContain('"github"');
    });

    it('prints specific key value', () => {
      const output = config(tmp.get(), ['storage']);

      expect(output).toEqual(['local']);
    });

    it('returns JSON for object value', () => {
      const output = config(tmp.get(), ['github.labels']);

      const parsed = JSON.parse(output[0]);
      expect(parsed).toEqual({ prd: 'tk:prd', plan: 'tk:plan' });
    });

    it('returns unknown key message for invalid path', () => {
      const output = config(tmp.get(), ['foo.bar.baz']);

      expect(output).toEqual(['Unknown key: foo.bar.baz']);
    });

    it('prints nested key value', () => {
      const dir = join(tmp.get(), '.tracerkit');
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, 'config.json'),
        JSON.stringify({ storage: 'github', github: { repo: 'org/repo' } }),
      );

      const output = config(tmp.get(), ['github.repo']);

      expect(output).toEqual(['org/repo']);
    });
  });

  describe('set (key + value)', () => {
    it('sets storage to github', () => {
      config(tmp.get(), ['storage', 'github']);

      const raw = readFileSync(
        join(tmp.get(), '.tracerkit', 'config.json'),
        'utf8',
      );
      expect(JSON.parse(raw).storage).toBe('github');
    });

    it('sets nested github.repo', () => {
      config(tmp.get(), ['github.repo', 'org/repo']);

      const raw = readFileSync(
        join(tmp.get(), '.tracerkit', 'config.json'),
        'utf8',
      );
      expect(JSON.parse(raw).github.repo).toBe('org/repo');
    });

    it('sets nested github.labels.prd', () => {
      config(tmp.get(), ['github.labels.prd', 'my:prd']);

      const raw = readFileSync(
        join(tmp.get(), '.tracerkit', 'config.json'),
        'utf8',
      );
      expect(JSON.parse(raw).github.labels.prd).toBe('my:prd');
    });

    it('re-renders skills when storage changes', () => {
      copyTemplates(tmp.get(), defaultConfig);

      config(tmp.get(), ['storage', 'github']);

      const skill = readFileSync(
        join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
        'utf8',
      );
      expect(skill).toContain('<!-- if:github -->');
      expect(skill).toContain('<!-- if:local -->');
    });

    it('returns confirmation message', () => {
      const output = config(tmp.get(), ['storage', 'github']);

      expect(output.some((l) => l.includes('storage'))).toBe(true);
    });

    it('re-renders skills when labels change', () => {
      const ghConfig: Config = {
        ...defaultConfig,
        storage: 'github',
        github: { labels: { prd: 'tk:prd', plan: 'tk:plan' } },
      };
      copyTemplates(tmp.get(), ghConfig);
      const dir = join(tmp.get(), '.tracerkit');
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, 'config.json'),
        JSON.stringify({ storage: 'github' }),
      );

      config(tmp.get(), ['github.labels.prd', 'custom:prd']);

      const skill = readFileSync(
        join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
        'utf8',
      );
      expect(skill).toContain('custom:prd');
    });

    it('re-renders skills when paths change', () => {
      copyTemplates(tmp.get(), defaultConfig);

      config(tmp.get(), ['paths.prds', 'custom/prds']);

      const skill = readFileSync(
        join(tmp.get(), '.claude/skills/tk:prd/SKILL.md'),
        'utf8',
      );
      expect(skill).toContain('custom/prds');
    });
  });
});
