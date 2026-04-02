# CLI Reference

> **Prerequisite** — install globally with `npm install -g tracerkit`. Skills call `tracerkit` directly to get deterministic output before the AI acts on it. Having the CLI in your PATH keeps this seamless.

| Command                     | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| `tracerkit init`            | Install skills to `~/.claude/skills/`; safe to re-run     |
| `tracerkit init <path>`     | Install skills to a specific project directory            |
| `tracerkit update`          | Refresh to latest version, skip modified files            |
| `tracerkit update --force`  | Replace modified files with latest versions               |
| `tracerkit uninstall`       | Remove TracerKit skills, keep user artifacts              |
| `tracerkit brief [path]`    | Show active features, progress, and suggested focus       |
| `tracerkit progress <slug>` | Show per-phase checkbox progress for a plan               |
| `tracerkit archive <slug>`  | Archive a completed feature (plan required, PRD optional) |
| `tracerkit --version`       | Print version                                             |
| `tracerkit --help`          | Show help message                                         |

All commands default to `~/.claude/skills/`. Pass a path to target a specific project directory instead.

> `npx tracerkit <command>` also works for one-off use without a global install, but skills will not be able to call the CLI seamlessly.
