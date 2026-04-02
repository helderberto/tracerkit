export interface Phase {
  title: string;
  checked: number;
  total: number;
}

export interface PlanResult {
  phases: Phase[];
}

const PHASE_RE = /^## (Phase \d+\s*.*)$/;
const CHECKED_RE = /^- \[x\] /i;
const UNCHECKED_RE = /^- \[ \] /;

export function parsePlan(content: string): PlanResult {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const phases: Phase[] = [];
  let current: Phase | null = null;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const phaseMatch = trimmed.match(PHASE_RE);

    if (trimmed.startsWith('## ')) {
      if (phaseMatch) {
        current = { title: phaseMatch[1].trim(), checked: 0, total: 0 };
        phases.push(current);
      } else {
        current = null;
      }
      continue;
    }

    if (!current) continue;

    if (CHECKED_RE.test(trimmed)) {
      current.checked++;
      current.total++;
    } else if (UNCHECKED_RE.test(trimmed)) {
      current.total++;
    }
  }

  return { phases };
}
