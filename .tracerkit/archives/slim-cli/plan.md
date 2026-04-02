# Plan: Slim CLI

> Source PRD: `.tracerkit/prds/slim-cli.md`

## Architectural Decisions

Durable decisions that apply across all phases:

- **Templates-first, CLI-second**: skill templates are updated before CLI code is removed — ensures the npm package ships coherent (new skills + slimmed CLI together)
- **Deprecation, not hard removal**: `brief`/`progress`/`archive` show migration messages instead of disappearing — protects existing users during the transition window
- **Skills own their algorithms**: progress counting, frontmatter parsing, and archive operations are described as exact inline instructions (regex patterns, step-by-step file operations) — no ambiguity for the AI
- **Pre-loaded context uses `ls`, not CLI**: skills discover available artifacts via shell `ls`, not custom CLI commands — zero runtime dependency

---

## Phase 1 — Skills work without CLI

**User stories**: #1, #2, #3, #6

### What to build

Update `tk:brief` and `tk:check` templates to be fully self-sufficient. Replace every `tracerkit` CLI call with inline algorithms the AI executes directly: reading PRDs, parsing frontmatter, counting checkboxes, building tables, moving files for archive.

### Done when

- [x] `tk:brief` uses `!ls {{paths.prds}}/ 2>&1` for pre-loaded context (no `tracerkit brief`)
- [x] `tk:brief` contains inline algorithm: read PRDs, parse frontmatter, count plan checkboxes, build table, determine focus
- [x] `tk:check` contains inline algorithm for counting `- [x]` vs `- [ ]` per `## Phase N` section
- [x] `tk:check` contains inline archive steps: create dir, copy PRD with updated frontmatter, copy plan with archived block, delete originals
- [x] Both skills specify exact output format (table columns, sort order, verdict structure)

---

## Phase 2 — All skill prompts refined

**User stories**: #1, #2

### What to build

Tighten all 4 skill prompts for consistent, precise results across sessions and models. Replace vague directives with explicit algorithms, exact formats, and unambiguous instructions.

### Done when

- [x] `tk:prd` interview branches have explicit skip conditions and slug derivation is unambiguous
- [x] `tk:prd` gray-area checkpoint has clear criteria for what counts as an ambiguity
- [x] `tk:plan` phase-splitting threshold is explicit (not "does this feel right?")
- [x] `tk:plan` "Done when" format enforced as checkbox list with verifiable conditions
- [x] `tk:brief` and `tk:check` prompts reviewed for clarity beyond the CLI-removal changes from Phase 1

---

## Phase 3 — CLI slimmed and deprecation messages

**User stories**: #4, #5, #7, #8

### What to build

Delete runtime modules and their tests. Replace CLI switch cases with deprecation messages that guide users to run `tracerkit update`. Update remaining tests.

### Done when

- [x] `frontmatter.ts`, `plan.ts` and their tests deleted
- [x] `commands/brief.ts`, `commands/progress.ts`, `commands/archive.ts` and their tests deleted
- [x] `constants.ts` COMMANDS array contains only `init`, `update`, `uninstall`
- [x] `cli.ts` returns deprecation message for `brief`, `progress`, `archive` ("removed — run `tracerkit update`")
- [x] `cli.test.ts` verifies deprecation messages; all tests pass

---

## Phase 4 — Docs revised

**User stories**: all

### What to build

Update all documentation to reflect the slim CLI. Apply prose revision to every doc — reorder sections, tighten arguments, improve clarity. Remove "deterministic CLI" as a selling point; position "zero runtime deps" as the new differentiator.

### Done when

- [x] README removes "deterministic CLI" messaging, updates install and workflow sections
- [x] `cli-reference.md` lists only lifecycle commands
- [x] `configuration.md` removes `tracerkit update` mention for config changes
- [x] `comparison.md` differentiator is "zero runtime deps", "CLI + AI split" row removed
- [x] All 5 docs + README pass prose revision (clarity, structure, brevity)

---

## Out of Scope

- Replacing the TypeScript build pipeline with a shell script (separate decision)
- Dropping `init`/`update`/`uninstall` CLI commands
- Changing the workflow steps or skill interface
- Modifying artifact paths or config format
- Adding new skills
- Multi-agent support or non-Claude-Code compatibility

## Open Questions

None.

---

## Verdict

- **Date**: 2026-04-02
- **Checks**: 20/20
- **BLOCKERS**: 0
- **SUGGESTIONS**: 2

## Archived

Archived on 2026-04-02.
