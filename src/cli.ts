import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { init } from './commands/init.ts';
import { update } from './commands/update.ts';
import { uninstall } from './commands/uninstall.ts';

const USAGE = [
  'Usage: tracerkit <command> [path]',
  '',
  'Commands:',
  '  init [path]       Install skills (global by default, or to a project path)',
  '  update [path]     Refresh files from latest version, skip modified files',
  '  uninstall [path]  Remove TracerKit skills, keep user artifacts',
];

function resolveTarget(args: string[]): string {
  const pathArg = args.find((a) => !a.startsWith('-'));
  return pathArg ? resolve(pathArg) : homedir();
}

export function run(args: string[]): string[] {
  const command = args[0];
  const rest = args.slice(1);

  switch (command) {
    case 'init':
      return init(resolveTarget(rest));
    case 'update':
      return update(resolveTarget(rest));
    case 'uninstall':
      return uninstall(resolveTarget(rest));
    default:
      return USAGE;
  }
}
