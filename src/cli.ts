import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import {
  archive,
  brief,
  init,
  progress,
  uninstall,
  update,
} from './commands/index.ts';
import { COMMANDS, FLAGS } from './constants.ts';

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
  '  --force           init: replace all skills; update: overwrite modified files',
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

function runSlugCommand(
  rest: string[],
  fn: (cwd: string, slug: string) => string[],
): string[] {
  const slugIndex = rest.findIndex((a) => !a.startsWith('-'));
  if (slugIndex === -1) return ['Error: missing <slug> argument', '', ...USAGE];
  const slug = rest[slugIndex];
  const target = rest.filter((_, i) => i !== slugIndex);
  try {
    return fn(resolveTarget(target, process.cwd()), slug);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return [`Error: ${msg}`];
  }
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

  switch (command) {
    case 'brief':
      return brief(resolveTarget(rest, process.cwd()));
    case 'init': {
      const force = rest.includes(FLAGS.force);
      const targetArgs = rest.filter((a) => a !== FLAGS.force);
      return init(resolveTarget(targetArgs), { force });
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
