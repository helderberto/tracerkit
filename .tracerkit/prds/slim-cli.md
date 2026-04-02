---
created: 2026-04-02T18:00:00Z
status: in_progress
---

# Slim CLI

## Problem Statement

TracerKit's value lives in 477 lines of skill markdown, but the project maintains 705 lines of TypeScript production code and 1492 lines of tests to support runtime CLI commands (`brief`, `progress`, `archive`) that perform simple operations the AI agent handles well: counting checkboxes, moving files, parsing frontmatter.

Each new deterministic feature triggers a cycle — implementation, tests, CLI wiring, docs, release — that compounds maintenance cost without proportional user value. Recent history shows this: `--force` on init led to a refactor delegating to update, which led to more edge-case fixes. The project is investing more energy in the delivery mechanism than in the workflow itself.

The runtime commands also force a global install requirement (`npm install -g tracerkit`) so skills can call them via `!tracerkit brief`. This adds friction and locks the project to Node.js.

## Current State

- CLI exposes 6 commands: 3 lifecycle (`init`, `update`, `uninstall`) + 3 runtime (`brief`, `progress`, `archive`)
- Skills `tk:brief` and `tk:check` depend on runtime commands for pre-loaded context and workflow steps
- Skills `tk:prd` and `tk:plan` only use `!ls` for pre-loaded context — no CLI dependency
- Modules `frontmatter.ts` and `plan.ts` exist solely to support runtime commands
- `config.ts` and `templates.ts` serve both lifecycle and runtime commands, but only lifecycle needs them post-migration

## Solution

Drop the three runtime CLI commands and make skills self-sufficient. The user experience stays identical — same slash commands, same output format, same workflow. Only the internals change: instead of delegating to a CLI binary, skills instruct the AI agent to read files, count checkboxes, and move artifacts directly.

The lifecycle commands (`init`, `update`, `uninstall`) stay. Template diffing and hash-based updates are genuinely better as deterministic code. The global install requirement softens — it's still recommended for `init`/`update`, but `npx tracerkit init` becomes viable since skills no longer call the binary at runtime.

## User Stories

1. As a user, I run `/tk:brief` and see the same feature dashboard table I see today, with status, age, progress, and focus recommendation
2. As a user, I run `/tk:check <slug>` and get the same verdict report with per-phase progress, blockers, and suggestions
3. As a user, I see `/tk:check` archive completed features to `.tracerkit/archives/` with updated frontmatter, same as today
4. As a user, I run `tracerkit init` and get skills installed — same as today
5. As a user, I run `tracerkit update` and get updated skills with hash-based diffing — same as today
6. As a user who installed via `npx tracerkit init`, I use all skills without a global install since skills no longer call the CLI binary
7. As a contributor, I find a smaller codebase with fewer modules and tests to maintain
8. As an existing user who upgrades the npm package before updating skills, I see a clear deprecation message ("command removed — run `tracerkit update`") instead of a silent failure or confusing usage text

## Implementation Decisions

### Architectural Decisions

- **Lifecycle stays deterministic**: `init`, `update`, `uninstall` remain TypeScript — hash-based template diffing is better as tested code
- **Runtime becomes AI-native**: `brief`, `progress`, `archive` logic moves into skill instructions — the AI reads files and computes results directly
- **Skills absorb algorithms**: each skill gets inline "How to" sections describing the exact algorithm (regex patterns, file operations) so the AI produces consistent results
- **Pre-loaded context**: `tk:brief` switches from `!tracerkit brief` to `!ls {{paths.prds}}/ 2>&1` — the AI builds the table from file reads
- **No atomicity guarantee for archive**: the CLI's rollback on failure is dropped. Archive is rare (only on `done`), failures are trivially recoverable, and adding complexity to the skill isn't justified
- **Semver minor**: removing CLI commands that are only consumed by the skills themselves (not by end users in scripts). No public API break in `src/index.ts`

### Modules to Delete

- `frontmatter` — parsing and updating YAML frontmatter. Logic described inline in `tk:check` skill
- `plan` — parsing plan checkboxes. Logic described inline in `tk:check` and `tk:brief` skills
- `commands/brief` — feature dashboard. Absorbed by `tk:brief` skill
- `commands/progress` — checkbox counting. Absorbed by `tk:check` skill
- `commands/archive` — file moves + frontmatter update. Absorbed by `tk:check` skill

### Modules to Modify

- `constants` — remove `brief`, `progress`, `archive` from `COMMANDS` array
- `cli` — replace 3 switch cases with deprecation messages guiding user to run `tracerkit update`. Remove dead imports. Deprecation messages are temporary (remove after 1-2 releases)
- `commands/index` — remove 3 re-exports

### Skills to Modify

All four skills are revised for precision — explicit algorithms, exact formats, and unambiguous instructions replace vague directives. The goal: consistent results regardless of which AI model or session runs the skill.

- `tk:brief` — replace `!tracerkit brief` with `!ls {{paths.prds}}/ 2>&1`. Add inline algorithm: read each PRD's frontmatter (status, created), check for matching plan file, count checkboxes, build markdown table, determine focus. Specify exact table columns, sort order, and focus-selection logic
- `tk:check` — replace `tracerkit progress <slug>` with inline algorithm: parse `## Phase N` headings, count `- [x]` vs `- [ ]` per section. Replace `tracerkit archive <slug>` with inline steps: create archive dir, copy PRD with `status: done` + `completed` timestamp, copy plan with archived block, delete originals. Specify exact regex patterns, verdict format, and archive file structure
- `tk:prd` — no CLI dependency changes. Improve prompt precision: tighten interview branch descriptions, clarify when to skip vs ask, make slug derivation rules explicit, sharpen gray-area checkpoint criteria
- `tk:plan` — no CLI dependency changes. Improve prompt precision: clarify phase-splitting thresholds, make "Done when" format stricter, tighten the quiz step to ask targeted questions instead of open-ended "does this feel right?"

### Documentation (all docs pass through prose revision)

- `README.md` — remove "deterministic CLI" messaging, remove global install advocacy, simplify "Why" section, update workflow examples
- `docs/cli-reference.md` — remove `brief`, `progress`, `archive` from command table
- `docs/examples.md` — keep examples intact (output format unchanged, only producer changes)
- `docs/configuration.md` — remove "run `tracerkit update` to regenerate" after config change
- `docs/comparison.md` — update differentiator from "Deterministic CLI + AI skills" to "Markdown skills — zero runtime deps". Remove "CLI + AI split" row. Update Runtime deps from "Node.js (global install)" to "None (Node.js optional for init/update)"

## Testing Decisions

- Delete all tests for removed modules: `frontmatter.test.ts`, `plan.test.ts`, `brief.test.ts`, `progress.test.ts`, `archive.test.ts`
- Update `cli.test.ts` to verify that `brief`, `progress`, `archive` subcommands return deprecation messages guiding the user to run `tracerkit update`
- No new tests needed — remaining modules (`init`, `update`, `uninstall`, `templates`, `config`) already have coverage
- Skill behavior is validated by `/tk:check` itself — no unit tests for markdown instructions

## Out of Scope

- Replacing the TypeScript build pipeline with a shell script (separate decision)
- Dropping `init`/`update`/`uninstall` CLI commands
- Changing the workflow steps or skill interface
- Modifying artifact paths or config format
- Adding new skills
- Multi-agent support or non-Claude-Code compatibility
