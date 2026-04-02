const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---(?:\n|$)/;

function normalize(content: string): string {
  return content.replace(/\r\n/g, '\n');
}

export function parseFrontmatter(content: string): Record<string, string> {
  const match = normalize(content).match(FRONTMATTER_RE);
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
  const normalized = normalize(content);
  const match = normalized.match(FRONTMATTER_RE);

  if (!match) {
    return `---\n${field}: ${value}\n---\n${normalized}`;
  }

  const lines = match[1].split('\n');
  const fieldRe = new RegExp(`^${field}\\s*:`);
  const idx = lines.findIndex((l) => fieldRe.test(l));

  if (idx !== -1) {
    lines[idx] = `${field}: ${value}`;
  } else {
    lines.push(`${field}: ${value}`);
  }

  const body = normalized.slice(match[0].length);
  return `---\n${lines.join('\n')}\n---\n${body}`;
}
