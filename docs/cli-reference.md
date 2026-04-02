# CLI Reference

The CLI manages skill installation and updates. Skills themselves run without CLI calls at runtime.

```bash
npm install -g tracerkit
```

## Commands

| Command                    | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `tracerkit init`           | Install skills to `~/.claude/skills/`; safe to re-run |
| `tracerkit init <path>`    | Install skills to a specific project directory        |
| `tracerkit update`         | Refresh to latest version, skip modified files        |
| `tracerkit update --force` | Replace modified files with latest versions           |
| `tracerkit uninstall`      | Remove TracerKit skills, keep user artifacts          |
| `tracerkit --version`      | Print version                                         |
| `tracerkit --help`         | Show help message                                     |

All commands default to `~/.claude/skills/`. Pass a path to target a specific project directory instead.

## Per-project usage

```bash
npx tracerkit init .         # install to .claude/skills/ in current dir
npx tracerkit update .       # update project-scoped skills
npx tracerkit uninstall .    # remove project-scoped skills
```

## Deprecated commands

`brief`, `progress`, and `archive` were removed. Skills now handle these operations directly with inline algorithms. Run `tracerkit update` to get the latest skills.
