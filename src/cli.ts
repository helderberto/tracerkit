import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { init } from './commands/init.ts';
import { update } from './commands/update.ts';
import { uninstall } from './commands/uninstall.ts';

const USAGE = [
  'Usage: tracerkit <command> [path]',
  '',
  'Commands:',
  '  init [path]       Install skills (default: home directory)',
  '  update [path]     Refresh files from latest version, skip modified files',
  '  uninstall [path]  Remove TracerKit skills, keep user artifacts',
  '',
  'Options:',
  '  --force           Replace modified files with latest versions',
  '  --global          Target home directory instead of current directory',
  '  --version, -v     Print version',
];

export function resolveTarget(args: string[]): string {
  const hasGlobal = args.includes('--global');
  const pathArg = args.find((a) => !a.startsWith('-'));

  if (hasGlobal && pathArg) {
    throw new Error('Cannot use --global with a path argument');
  }

  if (hasGlobal) return homedir();
  if (pathArg) return resolve(pathArg);
  return homedir();
}

export function run(args: string[]): string[] {
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
      output.push('', `Updated to tracerkit/${__VERSION__}`);
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
