# tk:status — Workflow Dashboard Skill

## Problem Statement

TracerKit users have no way to see the state of their features at a glance. After a few PRDs and plans accumulate, it's unclear which features are just defined, which are being implemented, and which are stuck on a NEEDS_WORK verdict. The only way to find out is manually listing directories and opening files — friction that breaks flow at session start.

## Solution

A new `/tk:status` skill that prints a table of all active features with their current state, age, and verification summary. Run it with no arguments at the start of any session to orient yourself. The skill also introduces a lightweight YAML frontmatter contract on PRDs, updated automatically by the existing skills as features move through the workflow — no manual bookkeeping.

## User Stories

1. As a developer, I want to run `/tk:status` and see all active features with their state, so that I know what needs attention
2. As a developer, I want to see how old each feature is, so that I can spot stalled work
3. As a developer, I want to see blocker and suggestion counts from the latest verification, so that I know the severity of NEEDS_WORK items
4. As a developer, I want archived/done features excluded from the table, so that the output stays focused on active work
5. As a developer, I want the frontmatter added automatically when I use `/tk:prd`, so that I don't have to maintain metadata manually
6. As a developer, I want `/tk:plan` to update the PRD status to `in_progress`, so that the status table reflects reality without extra steps
7. As a developer, I want `/tk:verify` (on PASS) to mark the PRD as `done` with a completion timestamp, so that the lifecycle is tracked end-to-end
8. As a developer, I want the README to document the metadata lifecycle, so that new users understand how frontmatter fields evolve across the workflow
9. As a developer, I want `/tk:status` to handle missing directories or empty states gracefully, so that it works in fresh projects with no PRDs yet
10. As a developer, I want `/tk:status` to work even if a PRD has no frontmatter (pre-existing PRDs), so that it degrades gracefully with a fallback state

## Implementation Decisions

### New Modules

- **`tk:status` skill** — single entry point (`/tk:status`, no arguments). Scans `prds/`, parses YAML frontmatter, optionally reads `plans/<slug>.md` for verdict block data, and prints a grouped table to the terminal.

- **Frontmatter contract** — shared convention across all skills. Standard YAML frontmatter delimiters (`---`). Fields: `created` (UTC timestamp), `status` (`created` | `in_progress` | `done`), `completed` (UTC timestamp, only when done). The PRD file is the single owner — other skills update it in place.

### Architectural Decisions

- **Single source of truth**: all metadata lives in the PRD's YAML frontmatter. No separate state file, no database.
- **Status values**: `created` (PRD exists, no plan yet), `in_progress` (plan generated), `done` (verified PASS). These map 1:1 to workflow stages.
- **Timestamp format**: ISO 8601 UTC (`2026-03-31T14:30:00Z`).
- **Verdict data**: read from the latest verdict block in `plans/<slug>.md` (blocker/suggestion counts). Not duplicated into frontmatter.
- **Graceful degradation**: PRDs without frontmatter (created before this feature) show as `unknown` status with no age.
- **Frontmatter-only writes**: `tk:plan` and `tk:verify` update only the YAML frontmatter block in the PRD. The rest of the PRD content is never touched by these skills.

### Schema Changes

None required.

### API Contracts

None required.

### Navigation

- `/tk:status` — new skill, no arguments, available globally after install

## Testing Decisions

- No automated tests for skills themselves (they are Markdown executed by Claude at runtime)
- Existing CLI tests for `init`, `update`, `uninstall` are unaffected
- Manual verification: run `/tk:status` against a project with a mix of PRD-only, in-progress, needs-work, and done features
- Key scenarios: empty `prds/` directory, PRD with no frontmatter, PRD with plan but no verdict, PRD with NEEDS_WORK verdict, freshly archived feature no longer showing

## Out of Scope

- Optional `<slug>` argument for single-feature detail view
- Archived features in the output
- Machine-readable output (JSON, CSV)
- Interactive mode (selecting a feature to act on from the table)
- Verdict history table (multi-row attempt tracking) — latest verdict only
- Filtering or sorting options
