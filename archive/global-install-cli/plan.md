# Plan: Global Install CLI

> Source PRD: `prds/global-install-cli.md`

## Architectural Decisions

- **Default target**: `process.cwd()` replaces `homedir()` — project-local is the common case
- **`--global` flag**: Mutually exclusive with positional path. Applies to `init`, `update`, `uninstall`
- **Version injection**: Vite `define` injects `package.json` version at build time — no runtime file reads

---

## Phase 1 — Project-local default, --global flag, --version

**User stories**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

### What to build

Change `resolveTarget` to default to `process.cwd()` instead of `homedir()`. Parse `--global` flag from args — returns `homedir()`. Throw if both `--global` and a positional path are provided. Add `--version` / `-v` handling before command routing, using a build-time injected version string via Vite `define`. Update USAGE help text. Update all existing tests and add new tests for `--global`, `--version`, and the error case.

### Tasks

1. Add `define: { __VERSION__: JSON.stringify(...) }` to `vite.config.ts` and declare the global in a `.d.ts` or inline
2. Update `resolveTarget` in `cli.ts`: no args → `process.cwd()`, `--global` → `homedir()`, path → `resolve(path)`, both → error
3. Add `--version` / `-v` handling in `run()` before the command switch
4. Update `USAGE` text to document `--global` flag and new defaults
5. Update `cli.test.ts` — fix existing tests for new default, add tests for `--global`, `--version`, `-v`, and `--global` + path error [agent:test-auditor]

### Done when

- `tracerkit init` writes skills to cwd
- `tracerkit init --global` writes skills to `~`
- `tracerkit init --global ./path` errors with clear message
- `tracerkit --version` prints `tracerkit/x.y.z`
- `tracerkit update` prints `Updated to tracerkit/x.y.z` and restart reminder
- All tests pass

---

## Out of Scope

- Auto-update / version checking against npm registry
- `tracerkit upgrade` self-upgrade command (use `npm install -g` directly)
- Config files (`.tracerkitrc`) for customizing `prds/` and `plans/` paths — future feature
- Plugin manifest (`.claude-plugin/plugin.json`) changes
- New skills or template changes

## Open Questions

None.

---

## Verdict

- **Result**: PASS
- **Date**: 2026-03-31
- **BLOCKERS**: 0
- **SUGGESTIONS**: 2

---

## Archived

- **Status**: closed
- **Closed**: 2026-03-31 (UTC)
