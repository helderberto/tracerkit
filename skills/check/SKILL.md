---
description: Verify implementation against plan. Shows progress, finds blockers, and marks complete when done. Use after implementing a plan, or without arguments to see a feature dashboard.
argument-hint: '[slug]'
---

# Check Implementation

Check implementation against a plan. Update checks, stamp findings, transition status, and mark complete when done.

**Interactive prompts**: present options as a numbered list and wait for the user's choice.

## Pre-loaded context

- Available plans: !`ls .tracerkit/plans/*.md 2>/dev/null || echo "(none)"`

## Input

The argument (if provided) is: $ARGUMENTS

Use the argument as `<slug>` if given.

If no argument is provided, build a summary table before asking which one to check:

```markdown
| Feature | Status | Progress |
| ------- | ------ | -------- |
| <slug>  | ...    | 3/7      |
```

For each `.md` file in `.tracerkit/prds/`:

1. Read the file, parse YAML frontmatter (block between `---` fences)
2. Extract `status` — use `unknown` if missing
3. If `.tracerkit/plans/<slug>.md` exists, count progress (see Progress Algorithm below). Show `—` if no plan.

Present each feature as an option and let the user pick which to verify.

## Progress Algorithm

Count `- [x]` and `- [ ]` lines under each `## Phase N` heading. Per-phase: `Phase N — title: checked/total`. Sum → `Total: checked/total`.

## Workflow

### 1. Load the plan

Read `.tracerkit/plans/<slug>.md`. If missing, list plans and ask the user to select one.

### 2. Load the PRD

Read source PRD referenced in plan header (`> Source PRD: ...`).

### 3. Fast-path: check if implementation exists

If primary module file(s) from Phase 1 don't exist, skip subagent — report `0/N — not yet started`, list Phase 1 done-when items, jump to Step 5.

### 3b. Launch read-only review

Use a **general-purpose subagent** (not `code-review` — that agent is for PR reviews). The subagent must be **read-only** (no file writes, no edits). It should:

1. Read every section of the plan — architectural decisions, each phase, done-when checkboxes
2. For each phase, check every `- [ ]` / `- [x]` item against the codebase
3. Run the project's test suite (e.g., `npm test`, `npx vitest run`) and include pass/fail results in the report. If no test command is discoverable, note this.
4. Compare user stories from the PRD against actual behavior

For each checkbox, determine whether it should be verified (`[x]`) or not (`[ ]`) and report this — do not edit any files.

Collect findings into two categories:

- **BLOCKERS** — checked items that don't hold up, failing tests, broken contracts. These prevent transitioning to `done`.
- **SUGGESTIONS** — improvements, minor gaps, style issues. These do not prevent `done`.

### 3c. Update checkboxes

Using the subagent's report, update each checkbox in `.tracerkit/plans/<slug>.md` to `[x]` or `[ ]`.

### 4. Determine outcome

Based on checks and findings, decide the status transition:

- All checks verified + zero BLOCKERS → transition PRD to `done`
- Some checks verified + zero BLOCKERS → keep PRD as `in_progress`
- BLOCKERS found → keep PRD as `in_progress`

### 5. Report to user

Count progress per phase (Progress Algorithm), then print:

```markdown
## Verification: <slug>

### Status: created | in_progress | done

### Progress

Phase 1 — title: checked/total
Phase 2 — title: checked/total
Total: checked/total

### BLOCKERS

- (list or "None")

### SUGGESTIONS

- (list or "None")
```

### 6. Stamp the plan

Append a verdict block at the bottom of `.tracerkit/plans/<slug>.md`:

```markdown
---

## Verdict

- **Date**: YYYY-MM-DD
- **Checks**: (checked/total)
- **BLOCKERS**: (count)
- **SUGGESTIONS**: (count)
```

If a previous verdict block exists, replace it with the new one.

### 7. On `done` — mark complete

If all checks pass and zero BLOCKERS:

1. Update PRD frontmatter: `status: done`, add `completed: <UTC ISO 8601>`
2. Update plan frontmatter: `status: done`, add `completed: <UTC ISO 8601>`

### 8. On `in_progress` (no blockers)

Show progress summary (checked/total per phase), list the next unchecked items to implement. Keep going.

### 9. On `in_progress` (with blockers)

List the blockers to fix, then re-run `/tk:check <slug>`.

## Rules

- The review subagent must be **read-only** — it must not create, edit, or delete any files
- The only file writes this skill makes are: checkboxes + verdict block in the plan, and the status updates on `done`
- Never modify implementation code — only observe and report
- If the PRD file is missing but all checks pass, warn and proceed — mark the plan complete only (skip PRD status update)
