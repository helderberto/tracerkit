import { init } from '#src/commands/init.js';
import { update } from '#src/commands/update.js';

const USAGE = [
  'Usage: tracerkit <command>',
  '',
  'Commands:',
  '  init        Scaffold .claude-plugin/ and skills/ into current project',
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
    default:
      return USAGE;
  }
}
