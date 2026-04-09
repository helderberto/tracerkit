import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

export const STORAGE_LOCAL = 'local' as const;
export const STORAGE_GITHUB = 'github' as const;
export const VALID_STORAGE = [STORAGE_LOCAL, STORAGE_GITHUB] as const;
export type Storage = (typeof VALID_STORAGE)[number];

export const DEFAULT_PATHS = {
  prds: '.tracerkit/prds',
  plans: '.tracerkit/plans',
} as const;

export const DEFAULT_GITHUB = {
  labels: {
    prd: 'tk:prd',
    plan: 'tk:plan',
  },
} as const;

export interface GitHubConfig {
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
  };
  github: GitHubConfig;
}

export function loadConfig(cwd: string): Config {
  const configPath = join(cwd, '.tracerkit', 'config.json');

  if (!existsSync(configPath)) {
    return {
      storage: STORAGE_LOCAL,
      paths: { ...DEFAULT_PATHS },
      github: { ...DEFAULT_GITHUB },
    };
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch {
    throw new Error('Invalid .tracerkit/config.json — expected valid JSON');
  }

  return {
    storage: parseStorage(parsed.storage),
    paths: parsePaths(parsed.paths),
    github: parseGitHub(parsed.github),
  };
}

function parseStorage(raw: unknown): Storage {
  return typeof raw === 'string' && VALID_STORAGE.includes(raw as Storage)
    ? (raw as Storage)
    : STORAGE_LOCAL;
}

function parsePaths(raw: unknown): Config['paths'] {
  const obj = isPlainObject(raw) ? raw : {};
  return {
    prds: typeof obj.prds === 'string' ? obj.prds : DEFAULT_PATHS.prds,
    plans: typeof obj.plans === 'string' ? obj.plans : DEFAULT_PATHS.plans,
  };
}

function parseGitHub(raw: unknown): GitHubConfig {
  const obj = isPlainObject(raw) ? raw : {};
  const labelsRaw = isPlainObject(obj.labels) ? obj.labels : {};

  return {
    labels: {
      prd:
        typeof labelsRaw.prd === 'string'
          ? labelsRaw.prd
          : DEFAULT_GITHUB.labels.prd,
      plan:
        typeof labelsRaw.plan === 'string'
          ? labelsRaw.plan
          : DEFAULT_GITHUB.labels.plan,
    },
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
