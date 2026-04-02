# Plan: Workflow V2 — Plan Checks, CLI Scripts, and Unified Statuses

> Source PRD: `.tracerkit/prds/workflow-v2.md`

## Architectural Decisions

- CLI scripts (`progress`, `archive`) are internal subcommands of the `tracerkit` binary — same pattern as `init`, `update`, `uninstall`
- Scripts are pure functions: config + filesystem -> stdout string[]. Testable with `useTmpDir()`.
- `loadConfig(cwd)` provides paths — scripts reuse the existing config system
- Plan parsing (checkbox counting, phase extraction) lives in its own module (`src/plan.ts`), reusable by both `progress` and `tk:check`
- Frontmatter parsing lives in its own module (`src/frontmatter.ts`), reusable by both `archive` and dashboard

---

## Phase 1 — Skill changes land with tests passing

**Covers**: US-01, US-02, US-03, US-04, US-05

The skill template changes already made in this branch. Finalize, verify tests, ensure clean diff.

### What to build

Confirm all skill changes are complete: `tk:check` renamed, `tk:status` removed, checkbox format in plan template, unified statuses, dashboard in `tk:check` without args. Update all docs (README, examples, metadata-lifecycle). All existing tests pass with new skill count (3).

### Done when

- [x] `tk:verify` renamed to `tk:check` in templates, source, and tests
- [x] `tk:status` skill removed from templates, source, and tests
- [x] Plan template uses checkbox format for "Done when"
- [x] Unified statuses (`created`, `in_progress`, `done`) — no emoji, no separate verdict vocabulary
- [x] `tk:check` without args shows dashboard table
- [x] README, examples, metadata-lifecycle docs updated
- [x] All tests pass (50/50), lint clean, typecheck clean

---

## Phase 2 — Plan parser and progress command

**Covers**: US-01, US-06, US-07

Build the foundational modules that parse plan files and count checkbox progress.

### What to build

`src/plan.ts` — parse a plan markdown file: extract phases (by `## Phase N` headers), count `- [x]` and `- [ ]` per phase. Return structured data.

`src/frontmatter.ts` — parse YAML frontmatter from a markdown file: extract `status`, `created`, `completed` fields. Update a single field without touching content.

`src/commands/progress.ts` — CLI command that takes a slug, loads config, reads the plan, calls plan parser, outputs per-phase and total progress.

Wire `progress` into `cli.ts` switch.

### Done when

- [x] `src/plan.ts` exports `parsePlan(content: string)` returning `{ phases: { title: string, checked: number, total: number }[] }`
- [x] `src/plan.ts` handles edge cases: no checkboxes, no phases, malformed markdown
- [x] `src/frontmatter.ts` exports `parseFrontmatter(content: string)` and `updateFrontmatter(content: string, field: string, value: string)`
- [x] `src/commands/progress.ts` outputs per-phase progress and total
- [x] `tracerkit progress <slug>` works end-to-end
- [x] Tests cover: all checked, partial, none, no plan file, plan without phases
- [x] All tests pass, lint clean, typecheck clean

---

## Phase 3 — Archive command

**Covers**: US-06, US-07

Deterministic archive: move files, update frontmatter, stamp plan.

### What to build

`src/commands/archive.ts` — takes a slug, loads config, moves PRD and plan to `archives/<slug>/`, updates PRD frontmatter to `done` + `completed` timestamp, appends archived block to plan.

Wire `archive` into `cli.ts` switch.

### Done when

- [x] `tracerkit archive <slug>` moves PRD and plan to archives directory
- [x] PRD frontmatter updated: `status: done`, `completed: <timestamp>`
- [x] Plan gets archived block appended
- [x] Errors: missing files, existing archive dir (warns + asks)
- [x] Tests cover: happy path, missing PRD, missing plan, existing archive
- [x] All tests pass, lint clean, typecheck clean

---

## Phase 4 — tk:check skill calls CLI scripts

**Covers**: US-06, US-07

Update the `tk:check` skill to call the internal scripts instead of doing mechanical work itself.

### What to build

Update `templates/.claude/skills/tk:check/SKILL.md` to:

- Call `npx tracerkit progress <slug>` for exact progress data
- Call `npx tracerkit archive <slug>` on `done` instead of manual file moves
- Remove manual frontmatter update instructions (archive handles it)

### Done when

- [x] `tk:check` SKILL.md references `tracerkit progress` for data gathering
- [x] `tk:check` SKILL.md references `tracerkit archive` for archiving
- [x] Manual file move and frontmatter update instructions removed from skill
- [x] Skill still handles: AI review, subagent, blocker/suggestion collection
- [x] Template test passes (no unresolved placeholders)

---

## Phase 5 — PRD and plan skill improvements

**Covers**: US-10, US-11, US-12, US-13

Add gray area detection, safety valve, research protocol, and current state section.

### What to build

Update `tk:prd` SKILL.md:

- Add step 3b (gray area checkpoint)
- Add "Current State" section to PRD template
- Add research protocol

Update `tk:plan` SKILL.md:

- Add safety valve rule
- Add research protocol

### Done when

- [x] `tk:prd` has gray area checkpoint (step 3b) after interview
- [x] PRD template includes "Current State" section
- [x] Research protocol added to `tk:prd` and `tk:plan`
- [x] Safety valve rule added to `tk:plan`
- [x] Template test passes

---

## Out of Scope

- `/tk:execute` skill (future -- separate PRD)
- Requirement traceability IDs (US-XX in PRD, referenced in plan) -- valuable but separate concern
- Token budget management
- Sub-agent delegation strategy
- Project-level init/roadmap
- Brownfield mapping (7-file analysis)
- Session handoff skill (covered by plan checks + `/tk:check` progress)

## Open Questions

None -- all decisions resolved during discussion.
