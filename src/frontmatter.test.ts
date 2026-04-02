import { parseFrontmatter, updateFrontmatter } from './frontmatter.ts';

describe('parseFrontmatter', () => {
  it('extracts fields from valid frontmatter', () => {
    const content = `---
status: in_progress
created: 2026-01-01
---

# Content here
`;

    const result = parseFrontmatter(content);

    expect(result).toEqual({ status: 'in_progress', created: '2026-01-01' });
  });

  it('returns empty object when no frontmatter', () => {
    const content = `# Just a heading\n\nSome text.\n`;

    expect(parseFrontmatter(content)).toEqual({});
  });

  it('returns empty object for empty content', () => {
    expect(parseFrontmatter('')).toEqual({});
  });

  it('handles CRLF line endings', () => {
    const content =
      '---\r\nstatus: in_progress\r\ncreated: 2026-01-01\r\n---\r\n\r\n# Content\r\n';

    const result = parseFrontmatter(content);

    expect(result).toEqual({ status: 'in_progress', created: '2026-01-01' });
  });

  it('handles frontmatter at EOF without trailing newline', () => {
    const content = '---\nstatus: done\n---';

    expect(parseFrontmatter(content)).toEqual({ status: 'done' });
  });

  it('handles values with multiple colons (timestamps)', () => {
    const content = `---
created: 2026-01-01T00:00:00Z
---

# Body
`;

    const result = parseFrontmatter(content);

    expect(result.created).toBe('2026-01-01T00:00:00Z');
  });

  it('handles frontmatter with extra fields', () => {
    const content = `---
status: created
created: 2026-01-01
completed: 2026-02-01
custom: value
---

Body
`;

    const result = parseFrontmatter(content);

    expect(result.status).toBe('created');
    expect(result.completed).toBe('2026-02-01');
    expect(result.custom).toBe('value');
  });
});

describe('updateFrontmatter', () => {
  it('updates an existing field', () => {
    const content = `---
status: in_progress
created: 2026-01-01
---

# Body
`;

    const result = updateFrontmatter(content, 'status', 'done');

    expect(result).toContain('status: done');
    expect(result).toContain('created: 2026-01-01');
    expect(result).toContain('# Body');
  });

  it('adds a new field to existing frontmatter', () => {
    const content = `---
status: in_progress
---

# Body
`;

    const result = updateFrontmatter(content, 'completed', '2026-04-02');

    expect(result).toContain('status: in_progress');
    expect(result).toContain('completed: 2026-04-02');
  });

  it('creates frontmatter when none exists', () => {
    const content = `# Body\n`;

    const result = updateFrontmatter(content, 'status', 'done');

    expect(result).toMatch(/^---\nstatus: done\n---\n/);
    expect(result).toContain('# Body');
  });

  it('preserves values with colons during update', () => {
    const content = `---
status: in_progress
created: 2026-01-01T00:00:00Z
---

# Body
`;

    const result = updateFrontmatter(content, 'status', 'done');

    expect(result).toContain('status: done');
    expect(result).toContain('created: 2026-01-01T00:00:00Z');
  });

  it('adds field to CRLF frontmatter', () => {
    const content = '---\r\nstatus: in_progress\r\n---\r\n\r\n# Body\r\n';

    const result = updateFrontmatter(content, 'completed', '2026-04-02');

    expect(result).toContain('status: in_progress');
    expect(result).toContain('completed: 2026-04-02');
  });

  it('handles CRLF when updating frontmatter', () => {
    const content = '---\r\nstatus: in_progress\r\n---\r\n\r\n# Body\r\n';

    const result = updateFrontmatter(content, 'status', 'done');

    expect(result).toContain('status: done');
    expect(result).toContain('# Body');
  });
});
