# CLI Reference

The CLI manages skill installation, updates, and per-project configuration. Skills themselves run without CLI calls at runtime.

```bash
$ npm install -g tracerkit
```

## Commands

| Command                                 | Description                                           |
| --------------------------------------- | ----------------------------------------------------- |
| `tracerkit init`                        | Install skills to `~/.claude/skills/`; safe to re-run |
| `tracerkit init <path>`                 | Install skills to a specific project directory        |
| `tracerkit update`                      | Refresh to latest version, skip modified files        |
| `tracerkit update --force`              | Replace modified files with latest versions           |
| `tracerkit config`                      | Print current project configuration                   |
| `tracerkit config <key>`                | Print a specific config value                         |
| `tracerkit config <key> <value>`        | Set a config value (per-project)                      |
| `tracerkit config [path] <key> <value>` | Set a config value for a specific directory           |
| `tracerkit uninstall`                   | Remove TracerKit skills, keep user artifacts          |
| `tracerkit --version`                   | Print version                                         |
| `tracerkit --help`                      | Show help message                                     |

`init`, `update`, and `uninstall` default to `~/.claude/skills/`. `config` defaults to the current working directory.

## Per-project usage

Storage is configured per-project. Skills resolve the backend at runtime:

```bash
$ tracerkit config storage github       # set current project to GitHub
$ tracerkit config github.repo org/repo # set target repo
$ tracerkit config storage local        # switch back to local
```

Team-scoped skill installs:

```bash
$ tracerkit init .                      # install to .claude/skills/ in current dir
$ tracerkit update .                    # update project-scoped skills
$ tracerkit uninstall .                 # remove project-scoped skills
```
