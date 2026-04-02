import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { useTmpDir } from '../test-setup.ts';
import { brief } from './brief.ts';

describe('brief', () => {
  const tmp = useTmpDir();

  function writePrd(slug: string, content: string) {
    const dir = join(tmp.get(), '.tracerkit', 'prds');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${slug}.md`), content);
  }

  function writePlan(slug: string, content: string) {
    const dir = join(tmp.get(), '.tracerkit', 'plans');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${slug}.md`), content);
  }

  it('returns empty message when prds dir missing', () => {
    const output = brief(tmp.get());
    expect(output).toContainEqual(expect.stringContaining('No features found'));
  });

  it('returns empty message when prds dir empty', () => {
    mkdirSync(join(tmp.get(), '.tracerkit', 'prds'), { recursive: true });
    const output = brief(tmp.get());
    expect(output).toContainEqual(expect.stringContaining('No features found'));
  });

  it('excludes features with status: done', () => {
    writePrd(
      'shipped',
      '---\nstatus: done\ncreated: 2026-01-01T00:00:00Z\n---\n# Shipped',
    );
    const output = brief(tmp.get());
    expect(output).toContainEqual(expect.stringContaining('No features found'));
  });

  it('shows single in_progress feature with auto-focus', () => {
    writePrd(
      'alpha',
      '---\nstatus: in_progress\ncreated: 2026-03-01T00:00:00Z\n---\n# Alpha',
    );
    writePlan(
      'alpha',
      '## Phase 1 — Setup\n\n- [x] Task A\n- [ ] Task B\n- [ ] Task C',
    );

    const output = brief(tmp.get());

    expect(output.join('\n')).toContain('alpha');
    expect(output.join('\n')).toContain('in_progress');
    expect(output.join('\n')).toContain('1/3');
    expect(output.join('\n')).toContain('Task B');
    expect(output).toContainEqual(expect.stringContaining('Focus'));
    expect(output).toContainEqual(expect.stringContaining('alpha'));
  });

  it('picks oldest in_progress when multiple in_progress', () => {
    writePrd(
      'newer',
      '---\nstatus: in_progress\ncreated: 2026-03-20T00:00:00Z\n---\n# Newer',
    );
    writePrd(
      'older',
      '---\nstatus: in_progress\ncreated: 2026-01-10T00:00:00Z\n---\n# Older',
    );

    const output = brief(tmp.get());
    const focusLine = output.find((l) => l.includes('Focus'));

    expect(focusLine).toBeDefined();
    expect(focusLine).toContain('older');
  });

  it('prefers in_progress over older created feature for focus', () => {
    writePrd(
      'ancient',
      '---\nstatus: created\ncreated: 2025-01-01T00:00:00Z\n---\n# Ancient',
    );
    writePrd(
      'active-a',
      '---\nstatus: in_progress\ncreated: 2026-03-10T00:00:00Z\n---\n# A',
    );
    writePrd(
      'active-b',
      '---\nstatus: in_progress\ncreated: 2026-03-20T00:00:00Z\n---\n# B',
    );

    const output = brief(tmp.get());
    const focusLine = output.find((l) => l.includes('Focus'));

    expect(focusLine).toContain('active-a');
  });

  it('picks oldest when zero in_progress', () => {
    writePrd(
      'young',
      '---\nstatus: created\ncreated: 2026-03-20T00:00:00Z\n---\n# Young',
    );
    writePrd(
      'old',
      '---\nstatus: created\ncreated: 2026-01-05T00:00:00Z\n---\n# Old',
    );

    const output = brief(tmp.get());
    const focusLine = output.find((l) => l.includes('Focus'));

    expect(focusLine).toContain('old');
  });

  it('shows unknown status when no frontmatter but plan exists', () => {
    writePrd('bare', '# Bare feature\n\nNo frontmatter.');
    writePlan(
      'bare',
      '## Phase 1 — Work\n\n- [ ] First task\n- [ ] Second task',
    );

    const output = brief(tmp.get());
    const joined = output.join('\n');

    expect(joined).toContain('bare');
    expect(joined).toContain('unknown');
    expect(joined).toContain('0/2');
    expect(joined).toContain('First task');
  });

  it('shows dash for progress and next when no plan', () => {
    writePrd(
      'noplan',
      '---\nstatus: created\ncreated: 2026-03-01T00:00:00Z\n---\n# No plan',
    );

    const output = brief(tmp.get());
    const row = output.find((l) => l.includes('noplan'));

    expect(row).toBeDefined();
    // Should contain dashes for progress and next
    expect(row!.match(/—/g)!.length).toBeGreaterThanOrEqual(2);
  });

  it('formats age correctly', () => {
    const now = new Date('2026-04-02T12:00:00Z');
    writePrd(
      'today',
      `---\nstatus: in_progress\ncreated: ${now.toISOString()}\n---\n# Today`,
    );
    writePrd(
      'days-ago',
      '---\nstatus: created\ncreated: 2026-03-30T00:00:00Z\n---\n# Days',
    );
    writePrd(
      'weeks-ago',
      '---\nstatus: created\ncreated: 2026-03-10T00:00:00Z\n---\n# Weeks',
    );
    writePrd(
      'months-ago',
      '---\nstatus: created\ncreated: 2025-12-01T00:00:00Z\n---\n# Months',
    );

    const output = brief(tmp.get(), now);
    const joined = output.join('\n');

    expect(joined).toContain('0d');
    expect(joined).toContain('3d');
    expect(joined).toContain('3w');
    expect(joined).toContain('4mo');
  });

  it('shows blank age when created missing', () => {
    writePrd('nocreated', '---\nstatus: in_progress\n---\n# No created');

    const output = brief(tmp.get());
    const row = output.find((l) => l.includes('nocreated'));

    expect(row).toBeDefined();
    // Age column should be empty (just whitespace between pipes)
    expect(row).toMatch(/\|\s+\|/);
  });

  it('shows dash for next when all checkboxes checked', () => {
    writePrd(
      'alldone',
      '---\nstatus: in_progress\ncreated: 2026-03-01T00:00:00Z\n---\n# All done',
    );
    writePlan('alldone', '## Phase 1 — Setup\n\n- [x] Task A\n- [x] Task B');

    const output = brief(tmp.get());
    const row = output.find((l) => l.includes('alldone'));

    expect(row).toBeDefined();
    expect(row).toContain('2/2');
    expect(row).toMatch(/\| — \|$/);
  });

  it('sorts features deterministically by created date', () => {
    writePrd(
      'charlie',
      '---\nstatus: created\ncreated: 2026-03-15T00:00:00Z\n---\n# C',
    );
    writePrd(
      'alpha',
      '---\nstatus: created\ncreated: 2026-01-01T00:00:00Z\n---\n# A',
    );
    writePrd(
      'bravo',
      '---\nstatus: created\ncreated: 2026-02-10T00:00:00Z\n---\n# B',
    );

    const output = brief(tmp.get());
    const rows = output.filter((l) => l.startsWith('|') && !l.startsWith('|-'));
    const slugs = rows.slice(1).map((r) => r.split('|')[1].trim());

    expect(slugs).toEqual(['alpha', 'bravo', 'charlie']);
  });

  it('no-created sorts last for focus selection', () => {
    writePrd(
      'has-date',
      '---\nstatus: created\ncreated: 2026-03-01T00:00:00Z\n---\n# Has date',
    );
    writePrd('no-date', '---\nstatus: created\n---\n# No date');

    const output = brief(tmp.get());
    const focusLine = output.find((l) => l.includes('Focus'));

    expect(focusLine).toContain('has-date');
  });
});
