import { parsePlan } from './plan.ts';

describe('parsePlan', () => {
  it('extracts phases with checkbox counts', () => {
    const content = `
## Phase 1 — Setup

### Done when

- [x] First task
- [x] Second task
- [ ] Third task

## Phase 2 — Build

### Done when

- [ ] Fourth task
- [ ] Fifth task
`;

    const result = parsePlan(content);

    expect(result.phases).toEqual([
      { title: 'Phase 1 — Setup', checked: 2, total: 3 },
      { title: 'Phase 2 — Build', checked: 0, total: 2 },
    ]);
  });

  it('returns all checked when complete', () => {
    const content = `
## Phase 1 — Done

- [x] Only task
`;

    const result = parsePlan(content);

    expect(result.phases).toEqual([
      { title: 'Phase 1 — Done', checked: 1, total: 1 },
    ]);
  });

  it('returns empty phases for content without phases', () => {
    const content = `# Some doc\n\nNo phases here.\n`;

    const result = parsePlan(content);

    expect(result.phases).toEqual([]);
  });

  it('returns zero totals for phases without checkboxes', () => {
    const content = `
## Phase 1 — Empty

No checkboxes here.

## Phase 2 — Also empty

Just text.
`;

    const result = parsePlan(content);

    expect(result.phases).toEqual([
      { title: 'Phase 1 — Empty', checked: 0, total: 0 },
      { title: 'Phase 2 — Also empty', checked: 0, total: 0 },
    ]);
  });

  it('handles mixed [x] and [X] in same phase', () => {
    const content = `
## Phase 1 — Mixed

- [x] Lower
- [X] Upper
- [ ] Unchecked
- [x] Another lower
`;

    const result = parsePlan(content);

    expect(result.phases[0]).toEqual({
      title: 'Phase 1 — Mixed',
      checked: 3,
      total: 4,
    });
  });

  it('handles malformed markdown gracefully', () => {
    const content = `random text\n- [x] orphan checkbox\n`;

    const result = parsePlan(content);

    expect(result.phases).toEqual([]);
  });

  it('counts uppercase [X] as checked', () => {
    const content = `
## Phase 1 — Mixed

- [X] Upper
- [x] Lower
- [ ] Unchecked
`;

    const result = parsePlan(content);

    expect(result.phases).toEqual([
      { title: 'Phase 1 — Mixed', checked: 2, total: 3 },
    ]);
  });

  it('handles CRLF line endings', () => {
    const content =
      '## Phase 1 — Setup\r\n\r\n- [x] Task A\r\n- [ ] Task B\r\n';

    const result = parsePlan(content);

    expect(result.phases).toEqual([
      { title: 'Phase 1 — Setup', checked: 1, total: 2 },
    ]);
  });

  it('ignores non-phase h2 headers', () => {
    const content = `
## Architectural Decisions

- [x] Something

## Phase 1 — Real

- [x] Task
- [ ] Another

## Out of Scope

- [x] Ignored
`;

    const result = parsePlan(content);

    expect(result.phases).toEqual([
      { title: 'Phase 1 — Real', checked: 1, total: 2 },
    ]);
  });
});
