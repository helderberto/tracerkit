export const SKILL_PREFIX = 'tk';
export const SKILL_NAMES = [
  `${SKILL_PREFIX}:brief`,
  `${SKILL_PREFIX}:prd`,
  `${SKILL_PREFIX}:plan`,
  `${SKILL_PREFIX}:check`,
] as const;
export const DEPRECATED_SKILLS = [`${SKILL_PREFIX}:verify`] as const;

export const FLAGS = {
  force: '--force',
  help: '--help',
  version: '--version',
} as const;

export const DEPRECATED_COMMANDS = ['brief', 'progress', 'archive'] as const;

export const COMMANDS = [
  {
    name: 'init',
    args: '[path]',
    desc: 'Install skills to ~/.claude/skills/ (or [path] if given)',
  },
  {
    name: 'update',
    args: '[path]',
    desc: 'Refresh unchanged files from latest version, skip modified',
  },
  {
    name: 'config',
    args: '[path] [key] [value]',
    desc: 'Get or set TracerKit configuration',
  },
  {
    name: 'uninstall',
    args: '[path]',
    desc: 'Remove TracerKit skill directories, keep .tracerkit/ artifacts',
  },
] as const;
