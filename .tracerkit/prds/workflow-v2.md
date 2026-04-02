---
created: 2026-04-02T14:00:00Z
status: in_progress
---

# Workflow V2 — Plan Checks, CLI Scripts, and Unified Statuses

## Problem Statement

TracerKit's skills rely on the AI agent for mechanical tasks (parsing YAML, counting checkboxes, moving files) that are error-prone and non-deterministic. The `/tk:verify` naming is unintuitive, and the project uses two parallel status vocabularies (frontmatter vs verdict) that create confusion.

## Current State

- Three skills: `tk:prd`, `tk:plan`, `tk:verify`
- `tk:verify` handles: code review, verdict stamping, archiving
- Plan "Done when" is prose — no structured progress tracking
- Two status systems: PRD frontmatter (`created`, `in_progress`, `done`) and verdict (`PASS`, `IN_PROGRESS`, `NEEDS_WORK`)
- All mechanical operations (YAML parsing, file moves, checkbox counting) done by AI
- Emojis in status labels

## Solution

Unify statuses, add checkbox-based progress tracking to plans, rename `tk:verify` to `tk:check`, and extract deterministic operations into CLI scripts that the skills call internally for accurate results.

## User Stories

- US-01: As a developer, I want plan phases to have checkbox-based "Done when" items, so that I can track progress and resume in new context windows
- US-02: As a developer, I want the agent to mark `[x]` during implementation, so that the plan reflects current progress
- US-03: As a developer, I want `/tk:check` (renamed from `/tk:verify`) to check my implementation against the plan, so that the command name feels natural
- US-04: As a developer, I want `/tk:check` without arguments to show a feature dashboard, so that I don't need a separate status skill
- US-05: As a developer, I want a single set of statuses (`created`, `in_progress`, `done`) used everywhere, so that there's one vocabulary to learn
- US-06: As a developer, I want `/tk:check` to call internal CLI scripts for deterministic operations (progress counting, archiving), so that mechanical results are always accurate
- US-07: As a developer, I want internal scripts for: progress counting (checkboxes per phase), frontmatter updates, and file archiving, so that the AI focuses only on code review
- US-10: As a developer, I want `/tk:prd` to detect gray areas during the interview and surface them explicitly, so that ambiguities don't become wrong assumptions
- US-11: As a developer, I want a safety valve in `/tk:plan` that stops if a phase has >5 atomic steps, so that underestimated phases get split
- US-12: As a developer, I want a research protocol in `/tk:prd` and `/tk:plan` that prevents the agent from fabricating technical assertions
- US-13: As a developer, I want a "Current State" section in the PRD template for brownfield changes, so that existing behavior is documented before proposing changes

## Implementation Decisions

### Skill Changes (already implemented in feat/plan-checks)

- `tk:verify` renamed to `tk:check`
- `tk:status` removed — dashboard built into `tk:check` without arguments
- Plan "Done when" changed from prose to checkbox list
- Unified statuses: `created` -> `in_progress` -> `done` (no separate verdict vocabulary)
- Verdict block in plan simplified: no `Result` field, just `Date`, `Checks`, `BLOCKERS`, `SUGGESTIONS`
- Emojis removed from all statuses and labels
- `tk:check` determines outcome by transitioning frontmatter status directly

### Internal CLI Scripts

Scripts called by the skills (not user-facing commands):

- `tracerkit progress <slug>` — count `- [x]` and `- [ ]` per phase in a plan, output per-phase and total
- `tracerkit archive <slug>` — move PRD+plan to archives/, update frontmatter to `done` + `completed` timestamp

### tk:check Orchestration

The `/tk:check` skill orchestrates scripts + AI:

**With argument** (`/tk:check <slug>`):

1. Run `tracerkit progress <slug>` for exact data
2. AI launches read-only subagent: explore codebase, run tests, verify each check against code, compare PRD user stories vs actual behavior
3. AI decides: blockers or not
4. If zero blockers + all checks verified -> run `tracerkit archive <slug>`

**Without argument** (`/tk:check`):

1. Scan PRDs and plans, show dashboard table with status and progress
2. Ask which feature to check
3. Proceed with the flow above

### PRD Template Additions

- "Current State" section between Problem Statement and Solution (brownfield context)
- Gray area checkpoint after interview (step 3b): surface unresolved ambiguities before writing
- Research protocol: codebase -> project docs -> flag uncertainty (never fabricate)

### Plan Template Additions

- Safety valve rule: if a phase reveals >5 atomic steps during implementation, stop and split

### Schema Changes

None required.

### API Contracts

Internal scripts output to stdout. Exit code 0 on success, 1 on error.

`tracerkit progress <slug>` output format:

```
Phase 1 — <title>: 3/3
Phase 2 — <title>: 1/2
Total: 4/5
```

### Navigation

No changes — scripts are subcommands of the existing `tracerkit` binary.

## Testing Decisions

- CLI commands are pure functions: input (file paths) -> output (string). Easy to test with fixture files.
- Test with plan fixtures containing various checkbox states (all checked, partial, none)
- Test frontmatter parsing with edge cases: no frontmatter, partial frontmatter, malformed YAML
- Test archive: files moved correctly, frontmatter updated, idempotent on re-run
- Prior art: existing `init.test.ts`, `update.test.ts`, `uninstall.test.ts` pattern with `useTmpDir()`

## Out of Scope

- `/tk:execute` skill (future — separate PRD)
- Requirement traceability IDs (US-XX in PRD, referenced in plan) — valuable but separate concern
- Token budget management
- Sub-agent delegation strategy
- Project-level init/roadmap
- Brownfield mapping (7-file analysis)
- Session handoff skill (covered by plan checks + `/tk:check` progress)
