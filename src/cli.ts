import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { init } from './commands/init.ts';
import { update } from './commands/update.ts';
import { uninstall } from './commands/uninstall.ts';

const USAGE = [
  'Usage: tracerkit <command> [path]',
  '',
  'Commands:',
  '  init [path]       Install skills to ~/.claude/skills/ (or [path] if given)',
  '  update [path]     Refresh unchanged files from latest version, skip modified',
  '  uninstall [path]  Remove TracerKit skill directories, keep .tracerkit/ artifacts',
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

export function run(args: string[]): string[] {
  if (args.includes('--help') || args.includes('-h')) {
    return USAGE;
  }

  if (args.includes('--version') || args.includes('-v')) {
    return [`tracerkit/${__VERSION__}`];
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
    default:
      return USAGE;
  }
}
