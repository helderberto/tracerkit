import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { config, init, uninstall, update } from './commands/index.ts';
import { COMMANDS, DEPRECATED_COMMANDS, FLAGS } from './constants.ts';

const { version } = JSON.parse(
  readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'),
    'utf8',
  ),
);

const maxLen = Math.max(...COMMANDS.map((c) => `${c.name} ${c.args}`.length));
const USAGE = [
  'Usage: tracerkit <command> [path]',
  '',
  'Commands:',
  ...COMMANDS.map(
    (c) => `  ${`${c.name} ${c.args}`.padEnd(maxLen + 2)}${c.desc}`,
  ),
  '',
  'Options:',
  '  --force           Overwrite modified files during update',
  '  --storage <type>  Set storage (local, github) during init',
  '  --help, -h        Show this help message',
  '  --version, -v     Print version',
  '',
  'All commands default to the home directory when no path is given.',
];

export function resolveTarget(args: string[], defaultDir = homedir()): string {
  const pathArg = args.find((a) => !a.startsWith('-'));
  if (pathArg) return resolve(pathArg);
  return defaultDir;
}

export function run(args: string[]): string[] {
  if (args.includes(FLAGS.help) || args.includes('-h')) {
    return USAGE;
  }

  if (args.includes(FLAGS.version) || args.includes('-v')) {
    return [`tracerkit/${version}`];
  }

  const command = args[0];
  const rest = args.slice(1);

  if (
    DEPRECATED_COMMANDS.includes(
      command as (typeof DEPRECATED_COMMANDS)[number],
    )
  ) {
    return [
      `"${command}" has been removed — skills handle this now.`,
      'Run `tracerkit update` to get the latest skills.',
    ];
  }

  switch (command) {
    case 'init': {
      const idx = rest.indexOf(FLAGS.storage);
      const storage = idx >= 0 ? rest[idx + 1] : undefined;
      const initArgs =
        idx >= 0 ? rest.filter((_, i) => i !== idx && i !== idx + 1) : rest;
      return init(resolveTarget(initArgs), {
        storage: storage as 'local' | 'github' | undefined,
      });
    }
    case 'update': {
      const force = rest.includes(FLAGS.force);
      const targetArgs = rest.filter((a) => a !== FLAGS.force);
      const output = update(resolveTarget(targetArgs), { force });
      output.push('', 'Updated to the latest TracerKit.');
      output.push(
        'If using Claude Code, restart your session to load changes.',
      );
      return output;
    }
    case 'config':
      return config(homedir(), rest);
    case 'uninstall':
      return uninstall(resolveTarget(rest));
    default:
      return USAGE;
  }
}
