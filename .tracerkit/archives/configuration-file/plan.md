# Plan: Configuration File

> Source PRD: `prds/configuration-file.md`

## Architectural Decisions

Durable decisions that apply across all phases:

- **Config location**: `.tracerkit/config.json` — lives alongside artifacts
- **Config shape**: `{ "paths": { "prds": "...", "plans": "...", "archives": "..." } }` — partial keys fall back to defaults
- **Default paths**: `.tracerkit/prds`, `.tracerkit/plans`, `.tracerkit/archives`
- **Placeholder format**: `{{paths.prds}}`, `{{paths.plans}}`, `{{paths.archives}}` in template files
- **Bake at CLI time**: `init` and `update` resolve config, substitute placeholders during copy. Skills never read config at runtime.
- **Config module**: `src/config.ts` exports `loadConfig(cwd: string): Config`
- **No migration**: old `prds/`, `plans/`, `archive/` directories are not auto-moved

---

## Phase 1 — Config loads and resolves paths

**User stories**: 5, 8, 9

### What to build

New `src/config.ts` module with `loadConfig(cwd)`. Reads `.tracerkit/config.json`, deep-merges with defaults, returns typed config. Handles: file missing (all defaults), partial keys (merge), invalid JSON (throw clear message), unknown keys (ignore). Co-located `src/config.test.ts`.

### Done when

`loadConfig` returns correct defaults when no config file exists, merges partial config correctly, and throws a descriptive error on invalid JSON. All unit tests pass.

---

## Phase 2 — Templates use placeholders, init/update bake paths

**User stories**: 1, 2, 3, 4, 6, 7, 11

### What to build

Replace all hardcoded `prds/`, `plans/`, `archive/` references in the four skill templates with `{{paths.prds}}`, `{{paths.plans}}`, `{{paths.archives}}` placeholders. Extend `copyTemplates` to accept a config param and substitute placeholders during copy. Wire `init` and `update` to call `loadConfig` and pass config through. Update `diffTemplates` to compare against rendered templates (with placeholders resolved). Update existing tests for `templates`, `init`, and `update` to account for placeholder substitution and new default paths.

### Done when

`tracerkit init` on a fresh directory produces skill files containing `.tracerkit/prds` (not `prds/`). A custom config with `"prds": "docs/prds"` produces skills referencing `docs/prds`. `tracerkit update` re-bakes paths from current config. No `{{...}}` markers remain in any generated skill file. All unit tests pass.

---

## Phase 3 — CLI text and uninstall reflect new defaults

**User stories**: 10

### What to build

Update `--help` output in `cli.ts` to reference `.tracerkit/` paths instead of `prds/` and `plans/`. Update `uninstall` command's help text. Verify existing CLI tests still pass.

### Done when

`tracerkit --help` output mentions `.tracerkit/` paths. `uninstall` description no longer references bare `prds/` and `plans/`. All CLI tests pass.

---

## Out of Scope

- `tracerkit migrate` command (no users yet)
- Runtime config reading in skills (paths baked at init/update)
- Config for anything beyond paths (skill names, behavior, etc.)
- Backward-compat shims for old `prds/`, `plans/`, `archive/` paths
- Validation of configured paths (existence, permissions)

## Open Questions

None.

---

## Verdict

- **Result**: PASS
- **Date**: 2026-03-31
- **BLOCKERS**: 0
- **SUGGESTIONS**: 3

---

## Archived

- **Status**: closed
- **Closed**: 2026-03-31 22:55 (UTC)
