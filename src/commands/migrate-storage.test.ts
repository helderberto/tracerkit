import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useTmpDir } from '../test-setup.ts';
import {
  parseFrontmatter,
  frontmatterToMetadata,
  statusToLabel,
  labelToStatus,
  extractSlugFromTitle,
  extractTitle,
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

  function writeArchive(cwd: string, slug: string): void {
    const dir = join(cwd, '.tracerkit', 'archives', slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'prd.md'),
      `---\ncreated: 2026-03-01T00:00:00Z\nstatus: done\ncompleted: 2026-04-01T00:00:00Z\n---\n\n# ${slug.replace(/-/g, ' ')}\n\nDone feature.`,
    );
    writeFileSync(
      join(dir, 'plan.md'),
      `# Plan: ${slug.replace(/-/g, ' ')}\n\n> Source PRD: .tracerkit/prds/${slug}.md\n\n- [x] All done\n\n## Archived\n\n[Timestamp: 2026-04-01]`,
    );
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

  it('returns early when storage is already github', () => {
    setupConfig(tmp.get(), { storage: 'github' });

    const output = migrateStorage(tmp.get());

    expect(output[0]).toContain('already');
  });

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

    it('creates closed issues with tk:done for archived features', () => {
      setupConfig(tmp.get());
      writeArchive(tmp.get(), 'old-feature');
      const { runGh, calls } = createMockGh();

      migrateStorage(tmp.get(), { runGh });

      const createCalls = calls.filter(
        (c) =>
          c.includes('issue') && c.includes('create') && !c.includes('label'),
      );
      expect(createCalls).toHaveLength(2); // prd + plan

      const closeCalls = calls.filter(
        (c) => c.includes('issue') && c.includes('close'),
      );
      expect(closeCalls).toHaveLength(2);

      // Verify tk:done label was used
      createCalls.forEach((call) => {
        expect(call.join(' ')).toContain('tk:done');
      });
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
});
