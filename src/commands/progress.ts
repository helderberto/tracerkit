import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '../config.ts';
import { parsePlan } from '../plan.ts';

export function progress(cwd: string, slug: string): string[] {
  const config = loadConfig(cwd);
  const planPath = join(cwd, config.paths.plans, `${slug}.md`);

  if (!existsSync(planPath)) {
    throw new Error(`Plan "${slug}" not found at ${planPath}`);
  }

  const content = readFileSync(planPath, 'utf8');
  const { phases } = parsePlan(content);

  if (phases.length === 0) {
    return ['No phases found in plan.', 'Total: 0/0'];
  }

  const lines: string[] = [];
  let totalChecked = 0;
  let totalAll = 0;

  for (const phase of phases) {
    totalChecked += phase.checked;
    totalAll += phase.total;
    lines.push(`  ${phase.title}: ${phase.checked}/${phase.total}`);
  }

  lines.push('');
  lines.push(`Total: ${totalChecked}/${totalAll}`);

  return lines;
}
