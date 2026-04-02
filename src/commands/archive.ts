import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '../config.ts';
import { updateFrontmatter } from '../frontmatter.ts';

export function archive(cwd: string, slug: string): string[] {
  const config = loadConfig(cwd);
  const prdPath = join(cwd, config.paths.prds, `${slug}.md`);
  const planPath = join(cwd, config.paths.plans, `${slug}.md`);
  const archiveDir = join(cwd, config.paths.archives, slug);

  const hasPrd = existsSync(prdPath);

  if (!existsSync(planPath)) {
    throw new Error(`Plan "${slug}" not found at ${planPath}`);
  }
  if (existsSync(archiveDir)) {
    throw new Error(`Archive "${slug}" already exists at ${archiveDir}`);
  }

  mkdirSync(archiveDir, { recursive: true });

  try {
    const now = new Date().toISOString();
    const output: string[] = [];

    if (hasPrd) {
      let prdContent = readFileSync(prdPath, 'utf8');
      prdContent = updateFrontmatter(prdContent, 'status', 'done');
      prdContent = updateFrontmatter(prdContent, 'completed', now);
      writeFileSync(join(archiveDir, 'prd.md'), prdContent);
    } else {
      output.push(`Warning: PRD "${slug}" missing, archiving plan only`);
    }

    let planContent = readFileSync(planPath, 'utf8');
    planContent += `\n## Archived\n\nArchived on ${now.slice(0, 10)}.\n`;
    writeFileSync(join(archiveDir, 'plan.md'), planContent);

    if (hasPrd) unlinkSync(prdPath);
    unlinkSync(planPath);

    output.push(`Archived "${slug}" to ${config.paths.archives}/${slug}/`);
    if (hasPrd) {
      output.push(`  prd.md  — status: done, completed: ${now}`);
    }
    output.push(`  plan.md — archived block appended`);

    return output;
  } catch (err) {
    rmSync(archiveDir, { recursive: true, force: true });
    throw err;
  }
}
