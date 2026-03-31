# CLI: init, update, uninstall

## Problem Statement

TracerKit's skills and plugin manifest must be manually copied into every project. There is no standard way to install, upgrade, or remove them. This friction discourages adoption and makes version upgrades error-prone.

## Solution

Publish `tracerkit` as an npm package with three commands:

- `npx tracerkit init` — scaffold `.claude-plugin/` and `skills/` into the current project
- `npx tracerkit update` — refresh files from the latest package version, skipping user-modified files
- `npx tracerkit uninstall` — remove TracerKit files, leaving user-generated artifacts untouched

Plain-text feedback with `✓`, `⚠`, `✗` prefixes. Zero runtime dependencies — Node 24 native TS support, argv parsed by hand.

## User Stories

1. As a developer, I want to run `npx tracerkit init` so that my project gets the plugin manifest and all skills in one command.
2. As a developer, I want `init` to abort if `.claude-plugin/` or `skills/` already exist so that I don't accidentally overwrite customizations.
3. As a developer, I want `init` to print which files were copied so I can verify what changed.
4. As a developer, I want to run `npx tracerkit update` so that I get the latest skill definitions without losing my modifications.
5. As a developer, I want `update` to skip files I've modified and report what was skipped so I know what to manually reconcile.
6. As a developer, I want `update` to add new files that didn't exist in my install so I get new skills automatically.
7. As a developer, I want `update` to overwrite files I haven't touched so they stay current.
8. As a developer, I want `update` to abort if TracerKit hasn't been initialized so I get a clear error.
9. As a developer, I want to run `npx tracerkit uninstall` so that I can cleanly remove TracerKit from my project.
10. As a developer, I want `uninstall` to remove only `.claude-plugin/` and `skills/`, leaving `prds/`, `plans/`, and `archive/` intact.
11. As a developer, I want `uninstall` to abort if TracerKit isn't installed so I don't get confusing errors.
12. As a developer, I want a clear error message when I run an unknown command or no command at all.
13. As a developer, I want each implementation phase to suggest running `/clear` before continuing to the next phase so context stays fresh.

## Implementation Decisions

### New Modules

**TemplateEngine** (`src/templates.ts`)

- `copyTemplates(targetDir: string): CopyResult` — discovers all files under `templates/` in the package, copies them into `targetDir`, returns list of copied paths
- `diffTemplates(targetDir: string): DiffResult` — compares installed files against package templates using content hash; returns `{ unchanged: string[], modified: string[], missing: string[] }`
- Hides: file discovery, recursive copy, hashing

**CLI** (`src/cli.ts`)

- Parses `process.argv`, dispatches to the matching command
- Formats output with `✓`, `⚠`, `✗` prefixes
- Hides: argv parsing, output formatting

**Commands** (`src/commands/{init,update,uninstall}.ts`)

- `init(cwd: string): void` — checks for existing install, copies templates or aborts
- `update(cwd: string): void` — diffs templates, overwrites unchanged, skips modified, adds missing, reports
- `uninstall(cwd: string): void` — removes `.claude-plugin/` and `skills/`, leaves user artifacts

Each command is thin — delegates to TemplateEngine for file operations, owns the policy decision (abort vs skip vs delete).

### Architectural Decisions

- **`templates/` is source of truth** — contains `.claude-plugin/` and `skills/` that get copied into target projects; top-level copies in the repo are removed
- **Zero runtime dependencies** — Node 24 natively strips TypeScript; `bin/cli.js` imports `src/cli.ts` directly with no build step or transpiler; `process.argv` parsed by hand
- **Content-hash diffing** — `update` hashes file contents to detect user modifications; no lockfile or manifest needed
- **Skills create directories on first use** — `init` does not scaffold `prds/`, `plans/`, or `archive/`

### Schema Changes

None required.

### API Contracts

None — CLI only, no programmatic API beyond the exported command functions.

### Navigation

Not applicable — this is a CLI tool, not a UI.

## Testing Decisions

- All three modules (TemplateEngine, CLI, Commands) need unit tests
- No unnecessary comments in code
- Test against a temp directory to avoid filesystem side effects
- Key test cases:
  - **init**: fresh project copies all files; existing install aborts with error; prints copied file list
  - **update**: unchanged files overwritten; modified files skipped; missing files added; not-initialized aborts
  - **uninstall**: removes `.claude-plugin/` and `skills/`; leaves `prds/`, `plans/`, `archive/`; not-initialized aborts
  - **TemplateEngine**: `copyTemplates` copies all template files recursively; `diffTemplates` correctly classifies unchanged/modified/missing
  - **CLI**: unknown command prints usage; no command prints usage; routes to correct command function

## Out of Scope

- No interactive prompts or skill selection
- No config file (`.tracerkitrc` or similar)
- No version pinning or lockfile for installed templates
- No colored output — plain text with symbol prefixes only
- `agents/` and `docs/` directories not part of init yet
- No `--force` flag to bypass conflict detection
