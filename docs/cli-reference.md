# CLI Reference

The CLI manages skill installation and updates. Skills themselves run without CLI calls at runtime.

```bash
$ npm install -g tracerkit
```

## Commands

| Command                           | Description                                           |
| --------------------------------- | ----------------------------------------------------- |
| `tracerkit init`                  | Install skills to `~/.claude/skills/`; safe to re-run |
| `tracerkit init <path>`           | Install skills to a specific project directory        |
| `tracerkit init --storage github` | Install with GitHub Issues as storage backend         |
| `tracerkit update`                | Refresh to latest version, skip modified files        |
| `tracerkit update --force`        | Replace modified files with latest versions           |
| `tracerkit config`                | Print current configuration                           |
| `tracerkit config <key>`          | Print a specific config value                         |
| `tracerkit config <key> <value>`  | Set a config value and re-render skills               |
| `tracerkit uninstall`             | Remove TracerKit skills, keep user artifacts          |
| `tracerkit --version`             | Print version                                         |
| `tracerkit --help`                | Show help message                                     |

All commands default to `~/.claude/skills/`. Pass a path to target a specific project directory instead.

## Per-project usage

```bash
$ tracerkit init .                      # install to .claude/skills/ in current dir
$ tracerkit init . --storage github     # install with GitHub storage
$ tracerkit update .                    # update project-scoped skills
$ tracerkit config storage github       # switch to GitHub storage
$ tracerkit uninstall .                 # remove project-scoped skills
```
