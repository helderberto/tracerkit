# Global Install CLI

## Problem Statement

TracerKit's CLI defaults to installing skills globally (`~`), but the most common use case is project-local. Users must remember to pass `.` every time. There's no `--global` flag, no `--version` flag, and no clear upgrade path after `npm install -g tracerkit@latest`.

## Solution

Flip the default: `tracerkit init` installs to the current project. Add `--global` for home-directory installs. Add `--version`. The upgrade flow becomes: `npm install -g tracerkit@latest && tracerkit update` (or `tracerkit update --global`). Also supports `npx tracerkit init` for one-off use without global install.

## User Stories

1. As a developer, I want `tracerkit init` to install skills in my current project, so that I don't have to remember to pass `.`
2. As a developer, I want `tracerkit init --global` to install skills in `~/.claude/skills/`, so that skills are available across all projects
3. As a developer, I want `tracerkit update` to refresh project-local skill files, so that I get latest templates after upgrading the npm package
4. As a developer, I want `tracerkit update --global` to refresh global skill files, so that global installs stay current
5. As a developer, I want `tracerkit uninstall` to remove skills from the current project, so that cleanup matches the install location
6. As a developer, I want `tracerkit uninstall --global` to remove global skills, so that I can clean up home-directory installs
7. As a developer, I want `tracerkit --version` to print the installed version, so that I can verify which version is running
8. As a developer, I want `tracerkit -v` to be a shorthand for `--version`, so that it follows CLI conventions
9. As a developer, I want an error when I pass both `--global` and a path argument, so that conflicting intent is caught early
10. As a developer, I want `npx tracerkit init` to work without a global install, so that I can try TracerKit without committing to a global install
11. As a developer, I want the upgrade flow to be `npm install -g tracerkit@latest` then `tracerkit update`, so that it's simple and predictable
12. As a developer, I want `tracerkit update` to skip user-modified files, so that my customizations are preserved during upgrades
13. As a developer, I want `tracerkit update` to print the new version after refreshing, so that I know which version is now installed
14. As a developer, I want `tracerkit update` to remind me to restart my Claude Code session, so that the new skills are loaded

## Implementation Decisions

### Modules to Modify

- **`cli.ts` > `resolveTarget(args)`** — New logic: `--global` returns `homedir()`, positional path returns `resolve(path)`, neither returns `process.cwd()`. Throws if both `--global` and a positional path are provided.
- **`cli.ts` > `run(args)`** — Handle `--version` / `-v` before command routing. Read version from package.json at build time (injected via Vite `define` or similar).
- **`cli.ts` > `USAGE`** — Update help text to reflect new defaults and `--global` flag.

No new modules. All changes are in `cli.ts` and its tests.

### Architectural Decisions

- **Default target**: `process.cwd()` (project-local), not `homedir()` (global). This matches the OpenSpec pattern and the most common use case.
- **`--global` flag**: Mutually exclusive with positional path arg. Applies to all three commands: `init`, `update`, `uninstall`.
- **Version string**: Injected at build time from `package.json` version field. No runtime file reads.
- **`npx` support**: Works out of the box via the existing `bin` field. No code changes needed.
- **Upgrade flow**: Two-step — `npm install -g tracerkit@latest` then `tracerkit update` (or `--global`). No auto-update, no self-upgrade command.
- **Post-update feedback**: `update` prints the current version and a reminder to restart Claude Code session so new skills are loaded.

### Schema Changes

None required.

### API Contracts

CLI interface changes:

```
tracerkit init [path]          # default: cwd (was: homedir)
tracerkit init --global        # target: homedir
tracerkit update [path]        # default: cwd (was: homedir)
tracerkit update --global      # target: homedir
tracerkit uninstall [path]     # default: cwd (was: homedir)
tracerkit uninstall --global   # target: homedir
tracerkit --version | -v       # print version
```

Error cases:

- `tracerkit init --global ./path` → error: `Cannot use --global with a path argument`

### Navigation

N/A — CLI only, no UI.

## Testing Decisions

- Test the `resolveTarget` behavior: no args → `cwd`, `--global` → `homedir`, path arg → `resolve(path)`, both → error
- Test `--version` / `-v` output matches expected format
- Test that all three commands (`init`, `update`, `uninstall`) respect `--global`
- Test error message when `--global` + path are combined
- Existing tests for `init`, `update`, `uninstall` behavior remain valid — only the default target changes
- Prior art: `src/cli.test.ts`, `src/commands/init.test.ts`, `src/commands/update.test.ts`, `src/commands/uninstall.test.ts`

## Out of Scope

- Auto-update / version checking against npm registry
- `tracerkit upgrade` self-upgrade command (use `npm install -g` directly)
- Config files (`.tracerkitrc`) for customizing `prds/` and `plans/` paths — future feature
- Plugin manifest (`.claude-plugin/plugin.json`) changes
- New skills or template changes
