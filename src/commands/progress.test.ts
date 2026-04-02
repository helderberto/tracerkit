import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { useTmpDir } from '../test-setup.ts';
import { progress } from './progress.ts';

describe('progress', () => {
  const tmp = useTmpDir();

  function writePlan(slug: string, content: string) {
    const dir = join(tmp.get(), '.tracerkit', 'plans');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${slug}.md`), content);
  }

  it('outputs per-phase and total progress', () => {
    writePlan(
      'feat',
      `
## Phase 1 — Setup

- [x] Task A
- [x] Task B

## Phase 2 — Build

- [x] Task C
- [ ] Task D
- [ ] Task E
`,
    );

    const output = progress(tmp.get(), 'feat');

    expect(output).toContainEqual(expect.stringContaining('Phase 1'));
    expect(output).toContainEqual(expect.stringContaining('2/2'));
    expect(output).toContainEqual(expect.stringContaining('Phase 2'));
    expect(output).toContainEqual(expect.stringContaining('1/3'));
    expect(output).toContainEqual(expect.stringContaining('Total: 3/5'));
  });

  it('handles plan with all tasks complete', () => {
    writePlan(
      'done',
      `
## Phase 1 — Only

- [x] Task
`,
    );

    const output = progress(tmp.get(), 'done');

    expect(output).toContainEqual(expect.stringContaining('1/1'));
    expect(output).toContainEqual(expect.stringContaining('Total: 1/1'));
  });

  it('handles plan without phases', () => {
    writePlan('empty', `# No phases\n\nJust text.\n`);

    const output = progress(tmp.get(), 'empty');

    expect(output).toContainEqual(expect.stringContaining('No phases found'));
  });

  it('throws when plan file missing', () => {
    expect(() => progress(tmp.get(), 'missing')).toThrow(/plan.*not found/i);
  });

  it('handles plan with no checkboxes in phases', () => {
    writePlan(
      'nochecks',
      `
## Phase 1 — Empty

No checkboxes.
`,
    );

    const output = progress(tmp.get(), 'nochecks');

    expect(output).toContainEqual(expect.stringContaining('0/0'));
  });
});
