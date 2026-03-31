# Plan: tk:status — Workflow Dashboard Skill

> Source PRD: `prds/tk-status.md`

## Architectural Decisions

Durable decisions that apply across all phases:

- **Frontmatter format**: standard YAML between `---` delimiters at top of PRD files
- **Fields**: `created` (ISO 8601 UTC), `status` (`created` | `in_progress` | `done`), `completed` (ISO 8601 UTC, only when done)
- **Single owner**: PRD file is the single source of truth for metadata — other skills do frontmatter-only updates, never touching PRD content
- **Skill registration**: `SKILL_NAMES` array in `src/templates.ts` is the source of truth for which skills ship with TracerKit

---

## Phase 1 — Frontmatter flows end-to-end

**User stories**: 5, 6, 7

### What to build

Add YAML frontmatter support across the three existing skills so that PRD metadata is written and updated automatically as a feature moves through the workflow.

- **`tk:prd`**: when writing a new PRD, prepend `---\ncreated: <UTC timestamp>\nstatus: created\n---` before the markdown content
- **`tk:plan`**: after reading the PRD, update its frontmatter to `status: in_progress` (frontmatter-only write, content untouched)
- **`tk:verify`**: on PASS verdict, update PRD frontmatter to `status: done` and add `completed: <UTC timestamp>` (frontmatter-only write, content untouched)

### Done when

Running the full `/tk:prd` → `/tk:plan` → `/tk:verify` flow produces a PRD file whose YAML frontmatter contains `status: done` and a `completed` UTC timestamp.

---

## Phase 2 — Status dashboard + docs

**User stories**: 1, 2, 3, 4, 8, 9, 10

### What to build

Create the `/tk:status` skill and register it in the CLI, then document the metadata lifecycle in the README.

- **`tk:status` SKILL.md**: new skill template in `templates/.claude/skills/tk:status/`. No arguments. Scans `prds/` for files, parses YAML frontmatter (`created`, `status`, `completed`), reads matching `plans/<slug>.md` for latest verdict block (blocker/suggestion counts), and prints a table grouped by state, sorted by created date. Graceful degradation: PRDs without frontmatter show as `unknown` status with no age. Empty `prds/` or missing directory prints a "no features found" message.
- **`SKILL_NAMES` update**: add `tk:status` to the array in `src/templates.ts`
- **Test updates**: update `init`, `update`, and `uninstall` tests to account for the fourth skill
- **README**: add a "Metadata Lifecycle" section documenting frontmatter fields and how they change across `prd → plan → verify`, including example frontmatter at each stage. Restructure the Skills section to distinguish **core skills** (`prd`, `plan`, `verify` — the workflow) from **helper skills** (`status` — useful but optional). Frame helpers as a category that will grow over time.

### Done when

`/tk:status` prints a table showing feature name, status, age, and verdict data from a project with a mix of PRD-only, in-progress, and needs-work features. README documents the frontmatter lifecycle. All existing tests pass with the new skill registered.

---

## Out of Scope

- Optional `<slug>` argument for single-feature detail view
- Archived features in the output
- Machine-readable output (JSON, CSV)
- Interactive mode (selecting a feature to act on from the table)
- Verdict history table (multi-row attempt tracking) — latest verdict only
- Filtering or sorting options

## Open Questions

None.
