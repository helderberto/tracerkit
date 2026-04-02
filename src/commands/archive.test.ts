import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { useTmpDir } from '../test-setup.ts';
import { archive } from './archive.ts';

describe('archive', () => {
  const tmp = useTmpDir();

  function setup(slug: string, prd: string, plan: string) {
    const prdsDir = join(tmp.get(), '.tracerkit', 'prds');
    const plansDir = join(tmp.get(), '.tracerkit', 'plans');
    mkdirSync(prdsDir, { recursive: true });
    mkdirSync(plansDir, { recursive: true });
    writeFileSync(join(prdsDir, `${slug}.md`), prd);
    writeFileSync(join(plansDir, `${slug}.md`), plan);
  }

  it('moves PRD and plan to archives directory', () => {
    setup(
      'feat',
      '---\nstatus: in_progress\ncreated: 2026-01-01T00:00:00Z\n---\n\n# PRD',
      '# Plan\n\n## Phase 1\n\n- [x] Done\n',
    );

    archive(tmp.get(), 'feat');

    const archiveDir = join(tmp.get(), '.tracerkit', 'archives', 'feat');
    expect(existsSync(join(archiveDir, 'prd.md'))).toBe(true);
    expect(existsSync(join(archiveDir, 'plan.md'))).toBe(true);
    expect(existsSync(join(tmp.get(), '.tracerkit', 'prds', 'feat.md'))).toBe(
      false,
    );
    expect(existsSync(join(tmp.get(), '.tracerkit', 'plans', 'feat.md'))).toBe(
      false,
    );
  });

  it('updates PRD frontmatter to done with completed timestamp', () => {
    setup(
      'feat',
      '---\nstatus: in_progress\ncreated: 2026-01-01T00:00:00Z\n---\n\n# PRD',
      '# Plan\n',
    );

    archive(tmp.get(), 'feat');

    const prd = readFileSync(
      join(tmp.get(), '.tracerkit', 'archives', 'feat', 'prd.md'),
      'utf8',
    );
    expect(prd).toContain('status: done');
    expect(prd).toMatch(/completed: \d{4}-\d{2}-\d{2}T/);
  });

  it('appends archived block to plan', () => {
    setup('feat', '---\nstatus: in_progress\n---\n\n# PRD', '# Plan\n');

    archive(tmp.get(), 'feat');

    const plan = readFileSync(
      join(tmp.get(), '.tracerkit', 'archives', 'feat', 'plan.md'),
      'utf8',
    );
    expect(plan).toMatch(/## Archived/);
    expect(plan).toMatch(/Archived on \d{4}-\d{2}-\d{2}/);
  });

  it('throws when PRD file missing', () => {
    const plansDir = join(tmp.get(), '.tracerkit', 'plans');
    mkdirSync(plansDir, { recursive: true });
    writeFileSync(join(plansDir, 'feat.md'), '# Plan\n');

    expect(() => archive(tmp.get(), 'feat')).toThrow(/prd.*not found/i);
  });

  it('throws when plan file missing', () => {
    const prdsDir = join(tmp.get(), '.tracerkit', 'prds');
    mkdirSync(prdsDir, { recursive: true });
    writeFileSync(join(prdsDir, 'feat.md'), '---\nstatus: in_progress\n---\n');

    expect(() => archive(tmp.get(), 'feat')).toThrow(/plan.*not found/i);
  });

  it('throws when archive directory already exists', () => {
    setup('feat', '---\nstatus: in_progress\n---\n\n# PRD', '# Plan\n');
    mkdirSync(join(tmp.get(), '.tracerkit', 'archives', 'feat'), {
      recursive: true,
    });

    expect(() => archive(tmp.get(), 'feat')).toThrow(/already exists/i);
  });
});
