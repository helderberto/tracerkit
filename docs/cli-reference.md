# CLI Reference

| Command                     | Description                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `tracerkit init`            | Install skills to `~/.claude/skills/`; safe to re-run — adds missing skills if already installed |
| `tracerkit init <path>`     | Install skills to a specific project directory; safe to re-run                                   |
| `tracerkit update`          | Refresh to latest version, skip modified files                                                   |
| `tracerkit update --force`  | Replace modified files with latest versions                                                      |
| `tracerkit uninstall`       | Remove TracerKit skills, keep user artifacts                                                     |
| `tracerkit brief [path]`    | Show active features, progress, and suggested focus                                              |
| `tracerkit progress <slug>` | Show per-phase checkbox progress for a plan                                                      |
| `tracerkit archive <slug>`  | Archive a completed feature (plan required, PRD optional)                                        |
| `tracerkit --version`       | Print version                                                                                    |
| `tracerkit --help`          | Show help message                                                                                |

All commands default to the home directory. Pass a path to target a specific project.
