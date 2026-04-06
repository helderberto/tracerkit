import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig, saveConfig } from '../config.ts';
import { copyTemplates, SKILL_NAMES } from '../templates.ts';

export function config(cwd: string, args: string[]): string[] {
  const [key, value] = args;

  if (!key) {
    return printConfig(cwd);
  }

  if (!value) {
    return getKey(cwd, key);
  }

  return setKey(cwd, key, value);
}

function printConfig(cwd: string): string[] {
  const cfg = loadConfig(cwd);
  const output =
    cfg.storage === 'local' ? { storage: cfg.storage, paths: cfg.paths } : cfg;
  return JSON.stringify(output, null, 2).split('\n');
}

function getKey(cwd: string, key: string): string[] {
  const cfg = loadConfig(cwd);
  const val = resolve(cfg as unknown as Record<string, unknown>, key);

  if (val === undefined) {
    return [`Unknown key: ${key}`];
  }

  if (typeof val === 'object') {
    return [JSON.stringify(val, null, 2)];
  }

  return [String(val)];
}

function setKey(cwd: string, key: string, value: string): string[] {
  const partial = expand(key, value);
  saveConfig(cwd, partial);

  const output = [`✓ Set ${key} = ${value}`];
  reRenderSkills(cwd, output);

  return output;
}

function reRenderSkills(cwd: string, output: string[]): void {
  const hasSkills = SKILL_NAMES.some((name) =>
    existsSync(join(cwd, '.claude', 'skills', name)),
  );

  if (!hasSkills) {
    return;
  }

  const cfg = loadConfig(cwd);
  copyTemplates(cwd, cfg);
  output.push('✓ Skills re-rendered');
}

function resolve(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function expand(key: string, value: string): Record<string, unknown> {
  const parts = key.split('.');
  const result: Record<string, unknown> = {};
  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const nested: Record<string, unknown> = {};
    current[parts[i]] = nested;
    current = nested;
  }
  current[parts[parts.length - 1]] = value;
  return result;
}
