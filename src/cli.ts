import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { init } from './commands/init.ts';
import { update } from './commands/update.ts';
import { uninstall } from './commands/uninstall.ts';
import { progress } from './commands/progress.ts';
import { archive } from './commands/archive.ts';

const { version } = JSON.parse(
  readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'),
    'utf8',
  ),
);

const USAGE = [
  'Usage: tracerkit <command> [path]',
  '',
  'Commands:',
  '  init [path]       Install skills to ~/.claude/skills/ (or [path] if given)',
  '  update [path]     Refresh unchanged files from latest version, skip modified',
  '  uninstall [path]  Remove TracerKit skill directories, keep .tracerkit/ artifacts',
  '  progress <slug>   Show per-phase checkbox progress for a plan',
  '  archive <slug>    Archive a completed feature (PRD + plan)',
  '',
  'Options:',
  '  --force           Overwrite modified files during update',
  '  --help, -h        Show this help message',
  '  --version, -v     Print version',
  '',
  'All commands default to the home directory when no path is given.',
];

export function resolveTarget(args: string[]): string {
  const pathArg = args.find((a) => !a.startsWith('-'));
  if (pathArg) return resolve(pathArg);
  return homedir();
}

function runSlugCommand(
  rest: string[],
  fn: (cwd: string, slug: string) => string[],
): string[] {
  const slug = rest.find((a) => !a.startsWith('-'));
  if (!slug) return ['Error: missing <slug> argument', '', ...USAGE];
  const target = rest.filter((a) => a !== slug);
  try {
    return fn(resolveTarget(target), slug);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return [`Error: ${msg}`];
  }
}

export function run(args: string[]): string[] {
  if (args.includes('--help') || args.includes('-h')) {
    return USAGE;
  }

  if (args.includes('--version') || args.includes('-v')) {
    return [`tracerkit/${version}`];
  }

  const command = args[0];
  const rest = args.slice(1);

  switch (command) {
    case 'init':
      return init(resolveTarget(rest));
    case 'update': {
      const force = rest.includes('--force');
      const targetArgs = rest.filter((a) => a !== '--force');
      const output = update(resolveTarget(targetArgs), { force });
      output.push('', 'Updated to the latest TracerKit.');
      output.push(
        'If using Claude Code, restart your session to load changes.',
      );
      return output;
    }
    case 'uninstall':
      return uninstall(resolveTarget(rest));
    case 'progress':
      return runSlugCommand(rest, progress);
    case 'archive':
      return runSlugCommand(rest, archive);
    default:
      return USAGE;
  }
}
