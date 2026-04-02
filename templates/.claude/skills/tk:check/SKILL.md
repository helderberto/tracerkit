---
description: Verify implementation against plan. Shows progress, finds blockers, and archives when done. Use after implementing a plan, or without arguments to see a feature dashboard.
argument-hint: '[slug]'
---

# Check Implementation

Check implementation against a plan. Update checks, stamp findings, transition status, and archive when done.

## Pre-loaded context

- Available plans: !`ls {{paths.plans}}/ 2>/dev/null || echo "no {{paths.plans}}/ directory found"`

## Input

The argument (if provided) is: $ARGUMENTS

Use the argument as `<slug>` if given.

If no argument is provided, scan `{{paths.prds}}/` and `{{paths.plans}}/` and show a summary table before asking which one to check:

```
| Feature | Status | Progress |
|---------|--------|----------|
| <slug>  | ...    | 3/7      |
```

- **Feature**: slug (filename without `.md`)
- **Status**: from PRD frontmatter (`created`, `in_progress`, `done`) — `unknown` if no frontmatter
- **Progress**: run `npx tracerkit progress <slug>` for each feature with a plan — use the Total line (e.g. "3/7"). Show `—` if no plan.

After the table, ask which feature to verify.

## Workflow

### 1. Load the plan

Read `{{paths.plans}}/<slug>.md`. If it does not exist, list available plans and ask.

### 2. Load the PRD

Read the source PRD referenced in the plan header (`> Source PRD: ...`).

### 3. Launch read-only review

Use a **read-only subagent** (no file writes, no edits) to:

1. Read every section of the plan — architectural decisions, each phase, done-when checkboxes
2. For each phase, check every `- [ ]` / `- [x]` item against the codebase
3. Run any test commands referenced in the plan or discoverable via project conventions
4. Compare user stories from the PRD against actual behavior

Mark each checkbox as verified (`[x]`) or not (`[ ]`) in the plan file.

Collect findings into two categories:

- **BLOCKERS** — checked items that don't hold up, failing tests, broken contracts. These prevent transitioning to `done`.
- **SUGGESTIONS** — improvements, minor gaps, style issues. These do not prevent `done`.

### 4. Determine outcome

Based on checks and findings, decide the status transition:

- All checks verified + zero BLOCKERS → transition PRD to `done`
- Some checks verified + zero BLOCKERS → keep PRD as `in_progress`
- BLOCKERS found → keep PRD as `in_progress`

### 5. Report to user

Run `npx tracerkit progress <slug>` to get exact per-phase progress, then print the verdict report:

```
## Verification: <slug>

### Status: created | in_progress | done

### Progress
<output from tracerkit progress>

### BLOCKERS
- (list or "None")

### SUGGESTIONS
- (list or "None")
```

### 6. Stamp the plan

Append a verdict block at the bottom of `{{paths.plans}}/<slug>.md`:

```markdown
---

## Verdict

- **Date**: YYYY-MM-DD
- **Checks**: (checked/total)
- **BLOCKERS**: (count)
- **SUGGESTIONS**: (count)
```

If a previous verdict block exists, replace it with the new one.

### 7. On `done` — archive

If all checks pass and zero BLOCKERS, run:

```
npx tracerkit archive <slug>
```

This handles: PRD frontmatter update (`status: done`, `completed` timestamp), file moves to `{{paths.archives}}/<slug>/`, and archived block on the plan.

Tell the user: archived to `{{paths.archives}}/<slug>/`, one-line summary of the feature.

### 8. On `in_progress` (no blockers)

Show progress summary (checked/total per phase), list the next unchecked items to implement. Keep going.

### 9. On `in_progress` (with blockers)

List the blockers to fix, then re-run `/tk:check <slug>`.

## Rules

- The review subagent must be **read-only** — it must not create, edit, or delete any files
- The only file writes this skill makes are: checkboxes + verdict block in the plan, and the archive command on `done`
- Never modify the source PRD manually — `tracerkit archive` handles frontmatter updates
- Never modify implementation code — only observe and report
- If the PRD file is missing but all checks pass, warn but proceed with archiving the plan only

## Error Handling

- Plan not found — list available plans and ask
- PRD referenced in plan not found — warn and continue with plan only
- `{{paths.plans}}/` missing — tell user to run `/tk:plan` first
- `{{paths.archives}}/<slug>/` already exists — `tracerkit archive` will error; warn and ask whether to remove it first
