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

### Done when

- [ ] `src/plan.ts` exports `parsePlan(content: string)` returning `{ phases: { title: string, checked: number, total: number }[] }`
- [ ] `src/plan.ts` handles edge cases: no checkboxes, no phases, malformed markdown
- [ ] `src/frontmatter.ts` exports `parseFrontmatter(content: string)` and `updateFrontmatter(content: string, field: string, value: string)`
- [ ] `src/commands/progress.ts` outputs per-phase progress and total
- [ ] `tracerkit progress <slug>` works end-to-end
- [ ] Tests cover: all checked, partial, none, no plan file, plan without phases
- [x] All tests pass, lint clean, typecheck clean

---

## Phase 3 — Archive command

**Covers**: US-06, US-07

### Done when

- [ ] `tracerkit archive <slug>` moves PRD and plan to archives directory
- [ ] PRD frontmatter updated: `status: done`, `completed: <timestamp>`
- [ ] Plan gets archived block appended
- [ ] Errors: missing files, existing archive dir (warns + asks)
- [ ] Tests cover: happy path, missing PRD, missing plan, existing archive
- [x] All tests pass, lint clean, typecheck clean

---

## Phase 4 — tk:check skill calls CLI scripts

**Covers**: US-06, US-07

### Done when

- [ ] `tk:check` SKILL.md references `tracerkit progress` for data gathering
- [ ] `tk:check` SKILL.md references `tracerkit archive` for archiving
- [ ] Manual file move and frontmatter update instructions removed from skill
- [x] Skill still handles: AI review, subagent, blocker/suggestion collection
- [x] Template test passes (no unresolved placeholders)

---

## Phase 5 — PRD and plan skill improvements

**Covers**: US-10, US-11, US-12, US-13

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

---

## Verdict

- **Date**: 2026-04-06
- **Checks**: 16/30
- **BLOCKERS**: 12
- **SUGGESTIONS**: 1

## Archived

Archived on 2026-04-06. Route changed — CLI scripts (`progress`, `archive`) dropped in favor of keeping mechanical work in the skill.
