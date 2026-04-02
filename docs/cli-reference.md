# CLI Reference

| Command                         | Description                                               |
| ------------------------------- | --------------------------------------------------------- |
| `npx tracerkit init`            | Install skills to `~/.claude/skills/`; safe to re-run     |
| `npx tracerkit init <path>`     | Install skills to a specific project directory            |
| `npx tracerkit update`          | Refresh to latest version, skip modified files            |
| `npx tracerkit update --force`  | Replace modified files with latest versions               |
| `npx tracerkit uninstall`       | Remove TracerKit skills, keep user artifacts              |
| `npx tracerkit brief [path]`    | Show active features, progress, and suggested focus       |
| `npx tracerkit progress <slug>` | Show per-phase checkbox progress for a plan               |
| `npx tracerkit archive <slug>`  | Archive a completed feature (plan required, PRD optional) |
| `npx tracerkit --version`       | Print version                                             |
| `npx tracerkit --help`          | Show help message                                         |

All commands default to `~/.claude/skills/`. Pass a path to target a specific project directory instead.
