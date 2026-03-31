import { homedir } from 'node:os';
import { init } from './commands/init.ts';
import { update } from './commands/update.ts';
import { uninstall } from './commands/uninstall.ts';

const USAGE = [
  'Usage: tracerkit <command> [options]',
  '',
  'Commands:',
  '  init [--global]  Scaffold skills into .claude/skills/',
  '  update           Refresh files from latest version, skip modified files',
  '  uninstall        Remove TracerKit skills, keep user artifacts',
];

export function run(args: string[], cwd: string): string[] {
  const command = args[0];
  const flags = new Set(args.slice(1));

  switch (command) {
    case 'init': {
      const target = flags.has('--global') ? homedir() : cwd;
      return init(target);
    }
    case 'update':
      return update(cwd);
    case 'uninstall':
      return uninstall(cwd);
    default:
      return USAGE;
  }
}
