import { init } from './commands/init.ts';
import { update } from './commands/update.ts';
import { uninstall } from './commands/uninstall.ts';

const USAGE = [
  'Usage: tracerkit <command>',
  '',
  'Commands:',
  '  init        Scaffold skills into .claude/skills/ in current project',
  '  update      Refresh files from latest version, skip modified files',
  '  uninstall   Remove TracerKit files, keep user artifacts',
];

export function run(args: string[], cwd: string): string[] {
  const command = args[0];

  switch (command) {
    case 'init':
      return init(cwd);
    case 'update':
      return update(cwd);
    case 'uninstall':
      return uninstall(cwd);
    default:
      return USAGE;
  }
}
