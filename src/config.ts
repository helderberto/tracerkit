import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

export const VALID_STORAGE = ['local', 'github'] as const;
export type Storage = (typeof VALID_STORAGE)[number];

export const DEFAULT_PATHS = {
  prds: '.tracerkit/prds',
  plans: '.tracerkit/plans',
  archives: '.tracerkit/archives',
} as const;

export const DEFAULT_GITHUB = {
  labels: {
    prd: 'tk:prd',
    plan: 'tk:plan',
  },
} as const;

export interface GitHubConfig {
  repo?: string;
  labels?: {
    prd?: string;
    plan?: string;
  };
}

export interface Config {
  storage: Storage;
  paths: {
    prds: string;
    plans: string;
    archives: string;
  };
  github: GitHubConfig;
}

export function loadConfig(cwd: string): Config {
  const configPath = join(cwd, '.tracerkit', 'config.json');

  if (!existsSync(configPath)) {
    return {
      storage: 'local',
      paths: { ...DEFAULT_PATHS },
      github: { ...DEFAULT_GITHUB },
    };
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

  const storage =
    typeof parsed.storage === 'string' &&
    VALID_STORAGE.includes(parsed.storage as Storage)
      ? (parsed.storage as Storage)
      : 'local';

  const ghRaw =
    typeof parsed.github === 'object' && parsed.github !== null
      ? (parsed.github as Record<string, unknown>)
      : {};

  const ghLabelsRaw =
    typeof ghRaw.labels === 'object' && ghRaw.labels !== null
      ? (ghRaw.labels as Record<string, unknown>)
      : {};

  const github: GitHubConfig = {
    ...(typeof ghRaw.repo === 'string' ? { repo: ghRaw.repo } : {}),
    labels: {
      prd:
        typeof ghLabelsRaw.prd === 'string'
          ? ghLabelsRaw.prd
          : DEFAULT_GITHUB.labels.prd,
      plan:
        typeof ghLabelsRaw.plan === 'string'
          ? ghLabelsRaw.plan
          : DEFAULT_GITHUB.labels.plan,
    },
  };

  return {
    storage,
    paths: {
      prds: typeof paths.prds === 'string' ? paths.prds : DEFAULT_PATHS.prds,
      plans:
        typeof paths.plans === 'string' ? paths.plans : DEFAULT_PATHS.plans,
      archives:
        typeof paths.archives === 'string'
          ? paths.archives
          : DEFAULT_PATHS.archives,
    },
    github,
  };
}

export function saveConfig(
  cwd: string,
  partial: Record<string, unknown>,
): void {
  const configPath = join(cwd, '.tracerkit', 'config.json');
  mkdirSync(dirname(configPath), { recursive: true });

  let existing: Record<string, unknown> = {};
  if (existsSync(configPath)) {
    try {
      existing = JSON.parse(readFileSync(configPath, 'utf8'));
    } catch {
      existing = {};
    }
  }

  const merged = deepMerge(existing, partial);
  writeFileSync(configPath, JSON.stringify(merged, null, 2) + '\n');
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (isPlainObject(result[key]) && isPlainObject(source[key])) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>,
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}
