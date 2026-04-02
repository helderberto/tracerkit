---
created: 2026-04-02T15:00:00Z
status: in_progress
---

# tk:brief — Session Briefing Skill

## Problem Statement

At the start of a work session, developers have no fast way to reorient themselves. The only options are manually opening PRDs and plans or running `/tk:check` which triggers a full AI code review — too heavy for "where was I?". Context loss between sessions breaks flow and wastes time.

## Current State

- `tk:check` without arguments shows a dashboard table, but runs a full implementation review — not designed for lightweight orientation
- `tk:status` skill (removed in workflow-v2) showed a static table with no next-action guidance
- `tracerkit progress <slug>` exists and returns per-phase checkbox counts
- `src/plan.ts` exports `parsePlan(content)` — returns `{ phases: { title, checked, total }[] }`
- `src/frontmatter.ts` exports `parseFrontmatter(content)` — returns `{ status, created, completed }`

## Solution

A new `/tk:brief` skill that calls `npx tracerkit brief` — a deterministic CLI command — and presents a session dashboard. Run it with no arguments at the start of any session. Output is a table of all active features plus a focused "Next" line pointing at the first unchecked task.

## User Stories

1. As a developer, I want to run `/tk:brief` and see all active features with status and progress, so that I can orient myself in under 10 seconds.
2. As a developer, I want to see the next unchecked task for each in-progress feature, so that I know exactly what to do next.
3. As a developer, I want a "Focus" line that highlights the single most important feature to work on, so that I don't have to decide from scratch.
4. As a developer, I want the progress numbers to come from a deterministic script, so that they are always accurate regardless of AI interpretation.
5. As a developer, I want done/archived features excluded from the table, so that the output stays focused on active work.
6. As a developer, I want features with no frontmatter (pre-workflow-v2 PRDs) to appear as `unknown` status, so that the skill degrades gracefully.
7. As a developer, I want features that have a plan but no frontmatter to still show progress, so that no data is lost.
8. As a developer, I want `/tk:brief` to work with no arguments, so that running it is always a single keystroke.
9. As a developer, I want `/tk:brief` to handle an empty `.tracerkit/prds/` gracefully, so that it works in fresh projects.
10. As a developer, I want `/tk:brief` to ask which feature to focus on when multiple are `in_progress`, so that I stay in control.

## Implementation Decisions

### New Modules

**`src/commands/brief.ts`**

- `brief(cwd: string): void` — scans all PRDs in `config.paths.prds`, parses frontmatter and plan for each, computes progress and next unchecked item, prints dashboard table + focus line to stdout
- Excludes features with `status: done`
- For features with a plan (regardless of frontmatter status), reads and parses the plan file to get progress and first `- [ ]` item
- Focus selection: if exactly one `in_progress` feature, auto-selects it; if zero or 2+, selects oldest by `created` date (features without `created` sort last); prints a trailing "Focus:" line

### Architectural Decisions

- **Deterministic by design**: `brief` is a pure function over filesystem state — no AI, no inference. All numbers come from `parsePlan()` and `parseFrontmatter()`.
- **Reuses existing modules**: `parsePlan` (from `src/plan.ts`) and `parseFrontmatter` (from `src/frontmatter.ts`) — no new parsing logic.
- **Output format**: markdown table to stdout, followed by a `Focus:` line. Skill presents it as-is.
- **Age calculation**: days since `created` field. `0d` if same day, `Nd` for days, `Nw` for weeks, `Nmo` for months. Blank if no `created`.
- **Progress column**: `checked/total` from `parsePlan` if plan exists; `—` if no plan file found.
- **Next column**: literal text of first `- [ ]` in the plan (stripped of markdown checkbox prefix). `—` if no plan or all checked.

### API Contracts

`tracerkit brief` output format (stdout):

```
## Session Brief — YYYY-MM-DD

| Feature     | Status      | Age | Progress | Next                         |
|-------------|-------------|-----|----------|------------------------------|
| workflow-v2 | in_progress | 0d  | 4/12     | implement parsePlan()        |
| cli-init    | unknown     | —   | —        | run /tk:plan                 |

Focus: workflow-v2 — Phase 2, 1/4 done.
Next: implement `tracerkit progress <slug>`.
```

Exit code 0 always (graceful degradation on missing dirs/files).

## Testing Decisions

- `brief` is a pure function: filesystem in, stdout string out — test with `useTmpDir()` (same pattern as `init.test.ts`)
- Key test cases:
  - Empty `prds/` directory — prints "No features found" message
  - Single `in_progress` feature — auto-selects as Focus
  - Multiple `in_progress` features — selects oldest by `created`
  - Feature with plan but no frontmatter — shows progress, `unknown` status
  - Feature with no plan — shows `—` for Progress and Next
  - Feature with all checkboxes checked — Next is `—`
  - `done` features — excluded from table

## Out of Scope

- Arguments or filtering (always scans all active PRDs)
- Interactive mode (selecting a feature from the table to act on)
- Prose narrative output
- Verdict/blocker data (that's `tk:check`)
- Writing or modifying any files
