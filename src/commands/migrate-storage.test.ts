import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useTmpDir } from '../test-setup.ts';
import { existsSync } from 'node:fs';
import {
  parseFrontmatter,
  parseMetadata,
  frontmatterToMetadata,
  metadataToFrontmatter,
  statusToLabel,
  labelToStatus,
  extractSlugFromTitle,
  extractTitle,
  classifyGhError,
  migrateStorage,
  type RunGh,
} from './migrate-storage.ts';

describe('parseFrontmatter', () => {
  it('extracts YAML metadata and body', () => {
    const content =
      '---\ncreated: 2026-04-06T10:00:00Z\nstatus: created\n---\n\n# My Feature\n\nBody here.';

    const result = parseFrontmatter(content);

    expect(result.metadata).toEqual({
      created: '2026-04-06T10:00:00Z',
      status: 'created',
    });
    expect(result.body).toBe('\n# My Feature\n\nBody here.');
  });

  it('returns empty metadata when no frontmatter', () => {
    const content = '# My Feature\n\nBody here.';

    const result = parseFrontmatter(content);

    expect(result.metadata).toEqual({});
    expect(result.body).toBe('# My Feature\n\nBody here.');
  });

  it('handles frontmatter with completed field', () => {
    const content =
      '---\ncreated: 2026-04-01T00:00:00Z\nstatus: done\ncompleted: 2026-04-06T00:00:00Z\n---\n\n# Done Feature';

    const result = parseFrontmatter(content);

    expect(result.metadata).toEqual({
      created: '2026-04-01T00:00:00Z',
      status: 'done',
      completed: '2026-04-06T00:00:00Z',
    });
  });

  it('handles empty frontmatter', () => {
    const content = '---\n---\n\nBody';

    const result = parseFrontmatter(content);

    expect(result.metadata).toEqual({});
    expect(result.body).toBe('\nBody');
  });

  it('skips lines without a key', () => {
    const content = '---\n: value-only\nstatus: created\n---\nBody';

    const result = parseFrontmatter(content);

    expect(result.metadata).toEqual({ status: 'created' });
  });
});

describe('frontmatterToMetadata', () => {
  it('converts metadata to HTML comment block', () => {
    const result = frontmatterToMetadata({
      created: '2026-04-06T10:00:00Z',
      status: 'created',
    });

    expect(result).toBe(
      '<!-- tk:metadata\ncreated: 2026-04-06T10:00:00Z\nstatus: created\n-->',
    );
  });

  it('includes completed when present', () => {
    const result = frontmatterToMetadata({
      created: '2026-04-01T00:00:00Z',
      status: 'done',
      completed: '2026-04-06T00:00:00Z',
    });

    expect(result).toContain('completed: 2026-04-06T00:00:00Z');
  });

  it('handles empty metadata', () => {
    const result = frontmatterToMetadata({});

    expect(result).toBe('<!-- tk:metadata\n-->');
  });
});

describe('statusToLabel', () => {
  it('maps created → tk:created', () => {
    expect(statusToLabel('created')).toBe('tk:created');
  });

  it('maps in_progress → tk:in-progress', () => {
    expect(statusToLabel('in_progress')).toBe('tk:in-progress');
  });

  it('maps done → tk:done', () => {
    expect(statusToLabel('done')).toBe('tk:done');
  });

  it('falls back to tk:created for unknown status', () => {
    expect(statusToLabel('unknown')).toBe('tk:created');
  });
});

describe('labelToStatus', () => {
  it('maps tk:created → created', () => {
    expect(labelToStatus('tk:created')).toBe('created');
  });

  it('maps tk:in-progress → in_progress', () => {
    expect(labelToStatus('tk:in-progress')).toBe('in_progress');
  });

  it('maps tk:done → done', () => {
    expect(labelToStatus('tk:done')).toBe('done');
  });

  it('falls back to created for unknown label', () => {
    expect(labelToStatus('unknown')).toBe('created');
  });
});

describe('parseMetadata', () => {
  it('extracts HTML comment metadata and body', () => {
    const content =
      '<!-- tk:metadata\ncreated: 2026-04-06T10:00:00Z\nstatus: created\n-->\n\n# My Feature\n\nBody here.';

    const result = parseMetadata(content);

    expect(result.metadata).toEqual({
      created: '2026-04-06T10:00:00Z',
      status: 'created',
    });
    expect(result.body).toBe('# My Feature\n\nBody here.');
  });

  it('returns empty metadata when no comment block', () => {
    const content = '# My Feature\n\nBody here.';

    const result = parseMetadata(content);

    expect(result.metadata).toEqual({});
    expect(result.body).toBe('# My Feature\n\nBody here.');
  });

  it('handles metadata with completed field', () => {
    const content =
      '<!-- tk:metadata\ncreated: 2026-04-01T00:00:00Z\nstatus: done\ncompleted: 2026-04-06T00:00:00Z\n-->\n\n# Done Feature';

    const result = parseMetadata(content);

    expect(result.metadata).toEqual({
      created: '2026-04-01T00:00:00Z',
      status: 'done',
      completed: '2026-04-06T00:00:00Z',
    });
  });

  it('handles empty metadata block', () => {
    const content = '<!-- tk:metadata\n-->\n\nBody';

    const result = parseMetadata(content);

    expect(result.metadata).toEqual({});
    expect(result.body).toBe('Body');
  });

  it('skips lines without a key', () => {
    const content =
      '<!-- tk:metadata\n: value-only\nstatus: created\n-->\n\nBody';

    const result = parseMetadata(content);

    expect(result.metadata).toEqual({ status: 'created' });
  });
});

describe('metadataToFrontmatter', () => {
  it('converts metadata to YAML frontmatter', () => {
    const result = metadataToFrontmatter({
      created: '2026-04-06T10:00:00Z',
      status: 'created',
    });

    expect(result).toBe(
      '---\ncreated: 2026-04-06T10:00:00Z\nstatus: created\n---\n',
    );
  });

  it('includes completed when present', () => {
    const result = metadataToFrontmatter({
      created: '2026-04-01T00:00:00Z',
      status: 'done',
      completed: '2026-04-06T00:00:00Z',
    });

    expect(result).toContain('completed: 2026-04-06T00:00:00Z');
    expect(result).toMatch(/^---\n/);
    expect(result).toMatch(/\n---\n$/);
  });

  it('handles empty metadata', () => {
    const result = metadataToFrontmatter({});

    expect(result).toBe('---\n---\n');
  });
});

describe('extractSlugFromTitle', () => {
  it('extracts slug from PRD title', () => {
    expect(extractSlugFromTitle('[tk:prd] my-feature: My Feature')).toBe(
      'my-feature',
    );
  });

  it('extracts slug from plan title', () => {
    expect(extractSlugFromTitle('[tk:plan] my-feature: Plan: My Feature')).toBe(
      'my-feature',
    );
  });

  it('extracts slug with custom label', () => {
    expect(extractSlugFromTitle('[custom:prd] my-feature: My Feature')).toBe(
      'my-feature',
    );
  });

  it('returns null for non-matching title', () => {
    expect(extractSlugFromTitle('Random issue title')).toBeNull();
  });
});

describe('extractTitle', () => {
  it('extracts first h1 heading', () => {
    expect(extractTitle('# My Feature\n\nSome body')).toBe('My Feature');
  });

  it('extracts heading with "Plan: " prefix', () => {
    expect(extractTitle('# Plan: My Feature\n\nBody')).toBe('Plan: My Feature');
  });

  it('returns slug fallback when no heading', () => {
    expect(extractTitle('No heading here')).toBe('Untitled');
  });
});

describe('classifyGhError', () => {
  it('returns gh CLI not found for ENOENT', () => {
    const err = classifyGhError({ code: 'ENOENT' });
    expect(err.message).toContain('gh CLI not found');
  });

  it('returns auth error for "not logged in"', () => {
    const err = classifyGhError({ stderr: 'not logged in to any hosts' });
    expect(err.message).toContain('Not authenticated');
  });

  it('returns auth error for "authentication" keyword', () => {
    const err = classifyGhError({ stderr: 'authentication required' });
    expect(err.message).toContain('Not authenticated');
  });

  it('returns rate limit error for "rate limit"', () => {
    const err = classifyGhError({ stderr: 'API rate limit exceeded' });
    expect(err.message).toContain('rate limit');
  });

  it('returns rate limit error for "403"', () => {
    const err = classifyGhError({ stderr: 'HTTP 403' });
    expect(err.message).toContain('rate limit');
  });

  it('returns repo not found for "not found"', () => {
    const err = classifyGhError({ stderr: 'repository not found' });
    expect(err.message).toContain('Repository not found');
  });

  it('returns repo not found for "404"', () => {
    const err = classifyGhError({ stderr: 'HTTP 404' });
    expect(err.message).toContain('Repository not found');
  });

  it('re-throws original Error for unknown errors', () => {
    const original = new Error('something unexpected');
    const err = classifyGhError(original);
    expect(err).toBe(original);
  });

  it('wraps non-Error values in Error', () => {
    const err = classifyGhError('string error');
    expect(err.message).toBe('string error');
  });

  it('uses message when stderr is missing', () => {
    const err = classifyGhError({ message: 'not logged in' });
    expect(err.message).toContain('Not authenticated');
  });
});

describe('migrateStorage', () => {
  const tmp = useTmpDir();

  function setupConfig(
    cwd: string,
    overrides: Record<string, unknown> = {},
  ): void {
    const dir = join(cwd, '.tracerkit');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'config.json'),
      JSON.stringify(
        {
          storage: 'local',
          github: { repo: 'owner/repo' },
          ...overrides,
        },
        null,
        2,
      ),
    );
  }

  function writePrd(
    cwd: string,
    slug: string,
    opts: {
      status?: string;
      created?: string;
      completed?: string;
      body?: string;
    } = {},
  ): void {
    const dir = join(cwd, '.tracerkit', 'prds');
    mkdirSync(dir, { recursive: true });
    const status = opts.status ?? 'created';
    const created = opts.created ?? '2026-04-06T10:00:00Z';
    let fm = `---\ncreated: ${created}\nstatus: ${status}\n`;
    if (opts.completed) fm += `completed: ${opts.completed}\n`;
    fm += '---\n';
    const body = opts.body ?? `\n# ${slug.replace(/-/g, ' ')}\n\nDescription.`;
    writeFileSync(join(dir, `${slug}.md`), fm + body);
  }

  function writePlan(cwd: string, slug: string, body?: string): void {
    const dir = join(cwd, '.tracerkit', 'plans');
    mkdirSync(dir, { recursive: true });
    const content =
      body ??
      `# Plan: ${slug.replace(/-/g, ' ')}\n\n> Source PRD: .tracerkit/prds/${slug}.md\n\n- [ ] Task 1\n- [x] Task 2`;
    writeFileSync(join(dir, `${slug}.md`), content);
  }

  function createMockGh(existingSlugs: string[] = []): {
    runGh: RunGh;
    calls: string[][];
  } {
    const calls: string[][] = [];
    const issueCounter = { current: 100 };

    const runGh: RunGh = (args: string[]) => {
      calls.push(args);
      const joined = args.join(' ');

      // gh issue list — return existing issues
      if (joined.includes('issue list')) {
        const issues = existingSlugs.map((slug, i) => ({
          number: i + 1,
          title: `[tk:prd] ${slug}: ${slug}`,
          labels: [{ name: 'tk:prd' }],
          state: 'OPEN',
        }));
        return JSON.stringify(issues);
      }

      // gh issue create — return URL with issue number
      if (joined.includes('issue create')) {
        const num = issueCounter.current++;
        return `https://github.com/owner/repo/issues/${num}`;
      }

      // gh issue close
      if (joined.includes('issue close')) {
        return '';
      }

      // gh label create
      if (joined.includes('label create')) {
        return '';
      }

      // gh repo view — return repo name
      if (joined.includes('repo view')) {
        return 'owner/repo';
      }

      return '';
    };

    return { runGh, calls };
  }

  function createGhToLocalMock(opts: {
    prdIssues?: Array<{
      number: number;
      title: string;
      body: string;
      labels: string[];
      state: string;
    }>;
    planIssues?: Array<{
      number: number;
      title: string;
      body: string;
      labels: string[];
      state: string;
    }>;
    mergedPrs?: Array<{ number: number; title: string }>;
  }): { runGh: RunGh; calls: string[][] } {
    const calls: string[][] = [];
    const runGh: RunGh = (args: string[]) => {
      calls.push(args);
      const joined = args.join(' ');

      if (joined.includes('issue list')) {
        const labelArg = args[args.indexOf('--label') + 1];
        if (labelArg === 'tk:prd' || labelArg?.includes('prd')) {
          return JSON.stringify(
            (opts.prdIssues ?? []).map((i) => ({
              ...i,
              labels: i.labels.map((name) => ({ name })),
            })),
          );
        }
        if (labelArg === 'tk:plan' || labelArg?.includes('plan')) {
          return JSON.stringify(
            (opts.planIssues ?? []).map((i) => ({
              ...i,
              labels: i.labels.map((name) => ({ name })),
            })),
          );
        }
        return '[]';
      }

      if (joined.includes('pr list')) {
        return JSON.stringify(opts.mergedPrs ?? []);
      }

      if (joined.includes('issue comment')) {
        return '';
      }

      if (joined.includes('repo view')) {
        return 'owner/repo';
      }

      return '';
    };
    return { runGh, calls };
  }

  describe('local → github', () => {
    it('creates GitHub issue from local PRD', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'my-feature');
      const { runGh, calls } = createMockGh();

      const output = migrateStorage(tmp.get(), { runGh });

      const createCalls = calls.filter(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCalls).toHaveLength(1);
      expect(output.some((l) => l.includes('my-feature'))).toBe(true);
    });

    it('creates GitHub issue from local plan', () => {
      setupConfig(tmp.get());
      writePlan(tmp.get(), 'my-feature');
      const { runGh, calls } = createMockGh();

      const output = migrateStorage(tmp.get(), { runGh });

      const createCalls = calls.filter(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCalls).toHaveLength(1);
      expect(output.some((l) => l.includes('my-feature'))).toBe(true);
    });

    it('creates both PRD and plan issues for same slug', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'my-feature');
      writePlan(tmp.get(), 'my-feature');
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const createCalls = calls.filter(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCalls).toHaveLength(2);
    });

    it('applies correct labels based on status', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'active-feature', { status: 'in_progress' });
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const createCall = calls.find(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCall).toBeDefined();
      const joined = createCall!.join(' ');
      expect(joined).toContain('tk:in-progress');
      expect(joined).toContain('tk:prd');
    });

    it('converts frontmatter to HTML comment metadata in issue body', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'my-feature', { created: '2026-04-06T10:00:00Z' });
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const createCall = calls.find(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCall).toBeDefined();
      const bodyIdx = createCall!.indexOf('--body') + 1;
      const body = createCall![bodyIdx];
      expect(body).toContain('<!-- tk:metadata');
      expect(body).toContain('created: 2026-04-06T10:00:00Z');
    });

    it('creates closed issues with tk:done for done features', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'old-feature', {
        status: 'done',
        completed: '2026-04-01T00:00:00Z',
      });
      writePlan(tmp.get(), 'old-feature');
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const createCalls = calls.filter(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCalls).toHaveLength(2); // prd + plan

      // PRD with status done should trigger close
      const closeCalls = calls.filter(
        (c) => c.includes('issue') && c.includes('close'),
      );
      expect(closeCalls.length).toBeGreaterThanOrEqual(1);

      // Verify tk:done label was used on PRD
      const prdCreate = createCalls.find((c) => c.join(' ').includes('tk:prd'));
      expect(prdCreate!.join(' ')).toContain('tk:done');
    });

    it('skips existing issues with matching slug', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'existing-feature');
      const { runGh, calls } = createMockGh(['existing-feature']);

      const output = migrateStorage(tmp.get(), { runGh });

      const createCalls = calls.filter(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCalls).toHaveLength(0);
      expect(output.some((l) => l.includes('skip') || l.includes('⚠'))).toBe(
        true,
      );
    });

    it('flips config to github after migration', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'my-feature');
      const { runGh } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const cfg = JSON.parse(
        readFileSync(join(tmp.get(), '.tracerkit', 'config.json'), 'utf8'),
      );
      expect(cfg.storage).toBe('github');
    });

    it('flips config even when no artifacts to migrate', () => {
      setupConfig(tmp.get());
      const { runGh } = createMockGh();

      const output = migrateStorage(tmp.get(), { runGh });

      const cfg = JSON.parse(
        readFileSync(join(tmp.get(), '.tracerkit', 'config.json'), 'utf8'),
      );
      expect(cfg.storage).toBe('github');
      expect(
        output.some(
          (l) => l.includes('nothing to migrate') || l.includes('No artifacts'),
        ),
      ).toBe(true);
    });

    it('ensures required labels exist before creating issues', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'my-feature');
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const labelCalls = calls.filter(
        (c) => c.includes('label') && c.includes('create'),
      );
      expect(labelCalls.length).toBeGreaterThan(0);
    });

    it('uses github.repo from config', () => {
      setupConfig(tmp.get(), { github: { repo: 'custom/repo' } });
      writePrd(tmp.get(), 'my-feature');
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const createCall = calls.find(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCall).toBeDefined();
      expect(createCall!.join(' ')).toContain('custom/repo');
    });

    it('auto-detects repo from git remote when not in config', () => {
      setupConfig(tmp.get(), { github: {} });
      writePrd(tmp.get(), 'my-feature');
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const repoViewCalls = calls.filter(
        (c) => c.includes('repo') && c.includes('view'),
      );
      expect(repoViewCalls).toHaveLength(1);
    });

    it('sets correct title format for PRD issues', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'my-feature', {
        body: '\n# My Cool Feature\n\nDescription.',
      });
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const createCall = calls.find(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      const titleIdx = createCall!.indexOf('--title') + 1;
      expect(createCall![titleIdx]).toBe(
        '[tk:prd] my-feature: My Cool Feature',
      );
    });

    it('sets correct title format for plan issues', () => {
      setupConfig(tmp.get());
      writePlan(tmp.get(), 'my-feature');
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const createCall = calls.find(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      const titleIdx = createCall!.indexOf('--title') + 1;
      expect(createCall![titleIdx]).toContain('[tk:plan] my-feature:');
    });
  });

  describe('github → local', () => {
    it('creates local PRD file from GitHub issue', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        prdIssues: [
          {
            number: 10,
            title: '[tk:prd] my-feature: My Feature',
            body: '<!-- tk:metadata\ncreated: 2026-04-06T10:00:00Z\nstatus: created\n-->\n\n# My Feature\n\nDescription.',
            labels: ['tk:prd', 'tk:created'],
            state: 'OPEN',
          },
        ],
      });

      const output = migrateStorage(tmp.get(), { runGh });

      const prdPath = join(tmp.get(), '.tracerkit', 'prds', 'my-feature.md');
      expect(existsSync(prdPath)).toBe(true);
      const content = readFileSync(prdPath, 'utf8');
      expect(content).toContain('---');
      expect(content).toContain('created: 2026-04-06T10:00:00Z');
      expect(content).toContain('status: created');
      expect(content).toContain('# My Feature');
      expect(output.some((l) => l.includes('my-feature'))).toBe(true);
    });

    it('creates local plan file from GitHub issue', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        planIssues: [
          {
            number: 11,
            title: '[tk:plan] my-feature: Plan: My Feature',
            body: '<!-- tk:metadata\nsource_prd: #10\nslug: my-feature\n-->\n\n# Plan: My Feature\n\n- [ ] Task 1',
            labels: ['tk:plan', 'tk:in-progress'],
            state: 'OPEN',
          },
        ],
      });

      const output = migrateStorage(tmp.get(), { runGh });

      const planPath = join(tmp.get(), '.tracerkit', 'plans', 'my-feature.md');
      expect(existsSync(planPath)).toBe(true);
      const content = readFileSync(planPath, 'utf8');
      expect(content).toContain('# Plan: My Feature');
      expect(output.some((l) => l.includes('my-feature'))).toBe(true);
    });

    it('writes closed tk:done issues to prds/plans with status done', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        prdIssues: [
          {
            number: 10,
            title: '[tk:prd] done-feature: Done Feature',
            body: '<!-- tk:metadata\ncreated: 2026-03-01T00:00:00Z\nstatus: done\ncompleted: 2026-04-01T00:00:00Z\n-->\n\n# Done Feature\n\nCompleted.',
            labels: ['tk:prd', 'tk:done'],
            state: 'CLOSED',
          },
        ],
        planIssues: [
          {
            number: 11,
            title: '[tk:plan] done-feature: Plan: Done Feature',
            body: '<!-- tk:metadata\nstatus: done\nslug: done-feature\n-->\n\n# Plan: Done Feature\n\n- [x] All done',
            labels: ['tk:plan', 'tk:done'],
            state: 'CLOSED',
          },
        ],
      });

      migrateStorage(tmp.get(), { runGh });

      const prdPath = join(tmp.get(), '.tracerkit', 'prds', 'done-feature.md');
      const planPath = join(
        tmp.get(),
        '.tracerkit',
        'plans',
        'done-feature.md',
      );
      expect(existsSync(prdPath)).toBe(true);
      expect(existsSync(planPath)).toBe(true);

      const prdContent = readFileSync(prdPath, 'utf8');
      expect(prdContent).toContain('status: done');
      expect(prdContent).toContain('completed: 2026-04-01T00:00:00Z');

      const planContent = readFileSync(planPath, 'utf8');
      expect(planContent).toContain('slug: done-feature');
    });

    it('skips when local file already exists', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      writePrd(tmp.get(), 'existing-feature');
      const { runGh } = createGhToLocalMock({
        prdIssues: [
          {
            number: 10,
            title: '[tk:prd] existing-feature: Existing Feature',
            body: '<!-- tk:metadata\ncreated: 2026-04-06T10:00:00Z\nstatus: created\n-->\n\n# Existing Feature',
            labels: ['tk:prd', 'tk:created'],
            state: 'OPEN',
          },
        ],
      });

      const output = migrateStorage(tmp.get(), { runGh });

      expect(output.some((l) => l.includes('skip') || l.includes('⚠'))).toBe(
        true,
      );
    });

    it('flips config to local after migration', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        prdIssues: [
          {
            number: 10,
            title: '[tk:prd] my-feature: My Feature',
            body: '<!-- tk:metadata\ncreated: 2026-04-06T10:00:00Z\nstatus: created\n-->\n\n# My Feature',
            labels: ['tk:prd', 'tk:created'],
            state: 'OPEN',
          },
        ],
      });

      migrateStorage(tmp.get(), { runGh });

      const cfg = JSON.parse(
        readFileSync(join(tmp.get(), '.tracerkit', 'config.json'), 'utf8'),
      );
      expect(cfg.storage).toBe('local');
    });

    it('flips config even when no GitHub issues exist', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({});

      const output = migrateStorage(tmp.get(), { runGh });

      const cfg = JSON.parse(
        readFileSync(join(tmp.get(), '.tracerkit', 'config.json'), 'utf8'),
      );
      expect(cfg.storage).toBe('local');
      expect(
        output.some(
          (l) => l.includes('nothing to migrate') || l.includes('No'),
        ),
      ).toBe(true);
    });

    it('derives status from labels when metadata has no status', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        prdIssues: [
          {
            number: 10,
            title: '[tk:prd] my-feature: My Feature',
            body: '<!-- tk:metadata\ncreated: 2026-04-06T10:00:00Z\n-->\n\n# My Feature',
            labels: ['tk:prd', 'tk:in-progress'],
            state: 'OPEN',
          },
        ],
      });

      migrateStorage(tmp.get(), { runGh });

      const content = readFileSync(
        join(tmp.get(), '.tracerkit', 'prds', 'my-feature.md'),
        'utf8',
      );
      expect(content).toContain('status: in_progress');
    });

    it('writes plan with frontmatter for active plans', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        planIssues: [
          {
            number: 11,
            title: '[tk:plan] my-feature: Plan: My Feature',
            body: '<!-- tk:metadata\nsource_prd: #10\nslug: my-feature\n-->\n\n# Plan: My Feature\n\n- [ ] Task',
            labels: ['tk:plan', 'tk:in-progress'],
            state: 'OPEN',
          },
        ],
      });

      migrateStorage(tmp.get(), { runGh });

      const content = readFileSync(
        join(tmp.get(), '.tracerkit', 'plans', 'my-feature.md'),
        'utf8',
      );
      expect(content).toContain('# Plan: My Feature');
      expect(content).not.toContain('<!-- tk:metadata');
      expect(content).toContain('---');
      expect(content).toContain('slug: my-feature');
      expect(content).toContain('source_prd: #10');
    });
  });

  describe('edge cases', () => {
    it('ignores non-.md files in prds and plans dirs', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'my-feature');
      // Add non-.md files
      writeFileSync(join(tmp.get(), '.tracerkit', 'prds', '.DS_Store'), 'junk');
      mkdirSync(join(tmp.get(), '.tracerkit', 'plans'), { recursive: true });
      writeFileSync(
        join(tmp.get(), '.tracerkit', 'plans', 'notes.txt'),
        'junk',
      );
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const createCalls = calls.filter(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCalls).toHaveLength(1);
    });

    it('uses custom labels from config', () => {
      setupConfig(tmp.get(), {
        github: { repo: 'owner/repo', labels: { prd: 'spec', plan: 'impl' } },
      });
      writePrd(tmp.get(), 'my-feature');
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const createCall = calls.find(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCall!.join(' ')).toContain('spec');
    });

    it('skips issues with slug in metadata matching existing', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'slug-match');
      const calls: string[][] = [];
      const runGh: RunGh = (args: string[]) => {
        calls.push(args);
        const joined = args.join(' ');
        if (joined.includes('issue list')) {
          return JSON.stringify([
            {
              number: 1,
              title: '[tk:prd] wrong-title: Wrong',
              body: '<!-- tk:metadata\nslug: slug-match\n-->\n\n# Feature',
              labels: [{ name: 'tk:prd' }],
              state: 'OPEN',
            },
          ]);
        }
        if (joined.includes('label create')) return '';
        return '';
      };

      const output = migrateStorage(tmp.get(), { runGh });

      expect(output.some((l) => l.includes('skip'))).toBe(true);
    });

    it('skips github→local issues with unparseable title (no slug)', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        prdIssues: [
          {
            number: 10,
            title: 'Random title without slug format',
            body: '<!-- tk:metadata\nstatus: created\n-->\n\n# Feature',
            labels: ['tk:prd', 'tk:created'],
            state: 'OPEN',
          },
        ],
      });

      const output = migrateStorage(tmp.get(), { runGh });

      expect(existsSync(join(tmp.get(), '.tracerkit', 'prds'))).toBe(false);
      expect(output.some((l) => l.includes('switched'))).toBe(true);
    });

    it('github→local prefers metadata.slug over title-derived slug', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        prdIssues: [
          {
            number: 10,
            title: '[tk:prd] wrong-slug: Edited Title',
            body: '<!-- tk:metadata\nslug: correct-slug\nstatus: created\n-->\n\n# Feature',
            labels: ['tk:prd', 'tk:created'],
            state: 'OPEN',
          },
        ],
      });

      migrateStorage(tmp.get(), { runGh });

      const correctPath = join(
        tmp.get(),
        '.tracerkit',
        'prds',
        'correct-slug.md',
      );
      const wrongPath = join(tmp.get(), '.tracerkit', 'prds', 'wrong-slug.md');
      expect(existsSync(correctPath)).toBe(true);
      expect(existsSync(wrongPath)).toBe(false);
    });

    it('github→local plan includes completed in frontmatter', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        planIssues: [
          {
            number: 11,
            title: '[tk:plan] done-plan: Plan',
            body: '<!-- tk:metadata\nslug: done-plan\nstatus: done\ncompleted: 2026-04-01T00:00:00Z\n-->\n\n# Plan',
            labels: ['tk:plan', 'tk:done'],
            state: 'CLOSED',
          },
        ],
      });

      migrateStorage(tmp.get(), { runGh });

      const content = readFileSync(
        join(tmp.get(), '.tracerkit', 'plans', 'done-plan.md'),
        'utf8',
      );
      expect(content).toContain('completed: 2026-04-01T00:00:00Z');
      expect(content).toContain('status: done');
    });

    it('github→local handles issue with no body', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        prdIssues: [
          {
            number: 10,
            title: '[tk:prd] no-body: No Body',
            body: '',
            labels: ['tk:prd', 'tk:created'],
            state: 'OPEN',
          },
        ],
      });

      const output = migrateStorage(tmp.get(), { runGh });

      const prdPath = join(tmp.get(), '.tracerkit', 'prds', 'no-body.md');
      expect(existsSync(prdPath)).toBe(true);
      expect(output.some((l) => l.includes('no-body'))).toBe(true);
    });

    it('github→local plan without source_prd or slug in metadata', () => {
      setupConfig(tmp.get(), { storage: 'github' });
      const { runGh } = createGhToLocalMock({
        planIssues: [
          {
            number: 11,
            title: '[tk:plan] bare-plan: Plan',
            body: '<!-- tk:metadata\n-->\n\n# Plan\n\n- [ ] Task',
            labels: ['tk:plan', 'tk:in-progress'],
            state: 'OPEN',
          },
        ],
      });

      migrateStorage(tmp.get(), { runGh });

      const content = readFileSync(
        join(tmp.get(), '.tracerkit', 'plans', 'bare-plan.md'),
        'utf8',
      );
      expect(content).toContain('slug: bare-plan');
      expect(content).toContain('status: in_progress');
      expect(content).not.toContain('source_prd');
    });

    it('github→local uses custom labels from config', () => {
      setupConfig(tmp.get(), {
        storage: 'github',
        github: { repo: 'owner/repo', labels: { prd: 'spec', plan: 'impl' } },
      });
      const calls: string[][] = [];
      const runGh: RunGh = (args: string[]) => {
        calls.push(args);
        const joined = args.join(' ');
        if (joined.includes('issue list')) return '[]';
        return '';
      };

      migrateStorage(tmp.get(), { runGh });

      const listCalls = calls.filter(
        (c) => c.includes('issue') && c.includes('list'),
      );
      expect(listCalls[0]).toContain('spec');
      expect(listCalls[1]).toContain('impl');
    });
  });

  describe('PR linking (local → github done features)', () => {
    it('adds PR reference when merged PR matches slug', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'linked-feature', {
        status: 'done',
        completed: '2026-04-01T00:00:00Z',
      });

      const calls: string[][] = [];
      const issueCounter = { current: 100 };
      const runGh: RunGh = (args: string[]) => {
        calls.push(args);
        const joined = args.join(' ');

        if (joined.includes('issue list')) return '[]';
        if (joined.includes('label create')) return '';
        if (joined.includes('issue create')) {
          const num = issueCounter.current++;
          return `https://github.com/owner/repo/issues/${num}`;
        }
        if (joined.includes('issue close')) return '';
        if (joined.includes('pr list')) {
          return JSON.stringify([
            { number: 55, title: 'feat: linked feature' },
          ]);
        }
        if (joined.includes('issue comment')) return '';
        return '';
      };

      migrateStorage(tmp.get(), { runGh });

      const commentCalls = calls.filter(
        (c) => c.includes('issue') && c.includes('comment'),
      );
      expect(commentCalls.length).toBeGreaterThan(0);
      const commentBody = commentCalls[0].join(' ');
      expect(commentBody).toContain('#55');
    });

    it('skips PR comment when no matching PR found', () => {
      setupConfig(tmp.get());
      writePrd(tmp.get(), 'no-pr-feature', {
        status: 'done',
        completed: '2026-04-01T00:00:00Z',
      });

      const calls: string[][] = [];
      const issueCounter = { current: 100 };
      const runGh: RunGh = (args: string[]) => {
        calls.push(args);
        const joined = args.join(' ');

        if (joined.includes('issue list')) return '[]';
        if (joined.includes('label create')) return '';
        if (joined.includes('issue create')) {
          const num = issueCounter.current++;
          return `https://github.com/owner/repo/issues/${num}`;
        }
        if (joined.includes('issue close')) return '';
        if (joined.includes('pr list')) return '[]';
        if (joined.includes('issue comment')) return '';
        return '';
      };

      migrateStorage(tmp.get(), { runGh });

      const commentCalls = calls.filter(
        (c) => c.includes('issue') && c.includes('comment'),
      );
      expect(commentCalls).toHaveLength(0);
    });
  });
});
