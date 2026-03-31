---
created: 2026-03-31T12:00:00Z
status: done
completed: 2026-03-31T22:55:00Z
---

# Configuration File

## Problem Statement

TracerKit hardcodes `prds/`, `plans/`, and `archive/` paths in every skill template. These directories clutter the project root alongside `src/`, `dist/`, and `node_modules/`. There is no way to customize where artifacts are stored, and the flat root layout doesn't signal that these directories belong to TracerKit.

## Solution

Add a `.tracerkit/config.json` file that lets users configure artifact directories. New defaults group everything under `.tracerkit/` (`prds/`, `plans/`, `archives/`). The CLI reads config at `init`/`update` time and bakes resolved paths into generated skill templates via placeholder substitution. No config file = all defaults.

## User Stories

1. As a developer, I want TracerKit artifacts stored under `.tracerkit/` so my project root stays clean.
2. As a developer, I want to override the PRD output directory so I can match my team's conventions.
3. As a developer, I want to override the plans output directory independently of the PRD directory.
4. As a developer, I want to override the archives directory independently of the other two.
5. As a developer, I want partial config (e.g., only override `prds`) to fall back to defaults for unspecified keys.
6. As a developer, I want `tracerkit init` to generate skills with the correct paths without me editing templates.
7. As a developer, I want `tracerkit update` to re-bake paths from config so I can change config and regenerate.
8. As a developer, I want a missing `.tracerkit/config.json` to silently use all defaults.
9. As a developer, I want invalid JSON in config to produce a clear error message.
10. As a developer, I want the `uninstall` command help text to reflect the new default directories.
11. As a developer, I want skill templates to reference the configured paths everywhere (output files, `ls` commands, archive destinations).

## Implementation Decisions

### New Modules

- **Config** (`loadConfig`): single function `loadConfig(cwd: string): Config`. Reads `.tracerkit/config.json`, deep-merges with defaults, returns typed config. Handles: file missing (all defaults), partial keys (merge), invalid JSON (throw with clear message), unknown keys (ignore).

### Architectural Decisions

- **Config file**: `.tracerkit/config.json` — lives alongside artifacts, no extra dotfiles in root.
- **Default paths**: `.tracerkit/prds`, `.tracerkit/plans`, `.tracerkit/archives` (note: `archives` plural, changed from old `archive` singular).
- **Bake at init/update time**: The CLI resolves config and substitutes placeholders in skill templates during `tracerkit init` and `tracerkit update`. Skills never read config at runtime.
- **Placeholder format**: `{{paths.prds}}`, `{{paths.plans}}`, `{{paths.archives}}` in template files. Replaced with configured values during copy.
- **Config shape**:
  ```json
  {
    "paths": {
      "prds": ".tracerkit/prds",
      "plans": ".tracerkit/plans",
      "archives": ".tracerkit/archives"
    }
  }
  ```
- **No migration**: existing `prds/`, `plans/`, `archive/` directories are not auto-moved. Users move files manually if needed.

### Schema Changes

None required.

### API Contracts

None required (CLI only).

### Navigation

No new routes. The CLI commands (`init`, `update`, `uninstall`) gain config awareness.

## Testing Decisions

- Test the config module in isolation: missing file, partial config, full config, invalid JSON, unknown keys
- Test template placeholder substitution: all placeholders replaced, no leftover `{{...}}` markers
- Test that `init` and `update` produce skills with resolved paths (integration-level)
- Prior art: existing `templates.test.ts`, `init.test.ts`, `update.test.ts`, `uninstall.test.ts` use filesystem stubs with `mkdirSync`/`writeFileSync`

## Out of Scope

- `tracerkit migrate` command (no users yet)
- Runtime config reading in skills (paths baked at init/update)
- Config for anything beyond paths (skill names, behavior, etc.)
- Backward-compat shims for old `prds/`, `plans/`, `archive/` paths
- Validation of configured paths (existence, permissions)
