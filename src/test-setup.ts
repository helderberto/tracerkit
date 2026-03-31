import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export function useTmpDir(): { get: () => string } {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'tk-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  return { get: () => dir };
}
