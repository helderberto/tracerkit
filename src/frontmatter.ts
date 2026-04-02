const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n/;

export function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return {};

  const fields: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) fields[key] = value;
  }
  return fields;
}

export function updateFrontmatter(
  content: string,
  field: string,
  value: string,
): string {
  const match = content.match(FRONTMATTER_RE);

  if (!match) {
    return `---\n${field}: ${value}\n---\n${content}`;
  }

  const existing = parseFrontmatter(content);
  existing[field] = value;

  const yaml = Object.entries(existing)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const body = content.slice(match[0].length);
  return `---\n${yaml}\n---\n${body}`;
}
