import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const DEFAULT_PATHS = {
  prds: '.tracerkit/prds',
  plans: '.tracerkit/plans',
  archives: '.tracerkit/archives',
} as const;

export interface Config {
  paths: {
    prds: string;
    plans: string;
    archives: string;
  };
}

export function loadConfig(cwd: string): Config {
  const configPath = join(cwd, '.tracerkit', 'config.json');

  if (!existsSync(configPath)) {
    return { paths: { ...DEFAULT_PATHS } };
  }

  let raw: string;
  let parsed: Record<string, unknown>;
  try {
    raw = readFileSync(configPath, 'utf8');
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid .tracerkit/config.json — expected valid JSON');
  }

  const paths =
    typeof parsed.paths === 'object' && parsed.paths !== null
      ? (parsed.paths as Record<string, unknown>)
      : {};

  return {
    paths: {
      prds: typeof paths.prds === 'string' ? paths.prds : DEFAULT_PATHS.prds,
      plans:
        typeof paths.plans === 'string' ? paths.plans : DEFAULT_PATHS.plans,
      archives:
        typeof paths.archives === 'string'
          ? paths.archives
          : DEFAULT_PATHS.archives,
    },
  };
}
