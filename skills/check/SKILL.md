---
description: Verify implementation against plan. Shows progress, finds blockers, and archives when done. Use after implementing a plan, or without arguments to see a feature dashboard.
argument-hint: '[slug]'
---

**Config**: read `.tracerkit/config.json` (default: `local`). Follow matching `<!-- if:local/github -->` blocks. GitHub: use `github.repo` from config or git remote.

# Check Implementation

Check implementation against a plan. Update checks, stamp findings, transition status, and archive when done.

## Pre-loaded context

<!-- if:local -->

- Available plans: !`ls .tracerkit/plans/ 2>&1`
  <!-- end:local -->
  <!-- if:github -->
- Available plans: list open GitHub Issues with label `{{github.labels.plan}}`
<!-- end:github -->

## Input

The argument (if provided) is: $ARGUMENTS

Use the argument as `<slug>` if given.

If no argument is provided, build a summary table before asking which one to check:

```markdown
| Feature | Status | Progress |
| ------- | ------ | -------- |
| <slug>  | ...    | 3/7      |
```

<!-- if:local -->

For each `.md` file in `.tracerkit/prds/`:

1. Read the file, parse YAML frontmatter (block between `---` fences)
2. Extract `status` — use `unknown` if missing
3. If `.tracerkit/plans/<slug>.md` exists, count progress (see Progress Algorithm below). Show `—` if no plan.
   <!-- end:local -->
   <!-- if:github -->

   List open GitHub Issues with label `{{github.labels.prd}}`:

4. For each PRD issue, extract `status` from labels (`tk:created`, `tk:in-progress`)
5. Find matching plan issue with label `{{github.labels.plan}}` and same slug in title
6. If plan issue exists, count progress from checkboxes in its body (see Progress Algorithm below). Show `—` if no plan.
<!-- end:github -->

Ask which feature to verify.

## Progress Algorithm

Count `- [x]` and `- [ ]` lines under each `## Phase N` heading. Per-phase: `Phase N — title: checked/total`. Sum → `Total: checked/total`.

## Workflow

### 1. Load the plan

<!-- if:local -->

Read `.tracerkit/plans/<slug>.md`. If missing, list plans and ask.

<!-- end:local -->
<!-- if:github -->

Find plan issue: open issue with label `{{github.labels.plan}}`, title matching `[{{github.labels.plan}}] <slug>:`. If missing, list plans and ask.

<!-- end:github -->

### 2. Load the PRD

<!-- if:local -->

Read source PRD referenced in plan header (`> Source PRD: ...`).

<!-- end:local -->
<!-- if:github -->

Read source PRD issue referenced in plan body (`> Source PRD: #<number>`).

<!-- end:github -->

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

<!-- if:local -->

Using the subagent's report, update each checkbox in `.tracerkit/plans/<slug>.md` to `[x]` or `[ ]`.

<!-- end:local -->
<!-- if:github -->

Using the subagent's report, update each checkbox in the plan issue body to `[x]` or `[ ]` by editing the issue.

<!-- end:github -->

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

<!-- if:local -->

Append a verdict block at the bottom of `.tracerkit/plans/<slug>.md`:

<!-- end:local -->
<!-- if:github -->

Append a verdict block at the bottom of the plan issue body by editing the issue:

<!-- end:github -->

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

If all checks pass and zero BLOCKERS:

<!-- if:local -->

Archive to `.tracerkit/archives/<slug>/`:

1. Copy PRD → `prd.md` (set `status: done`, add `completed` timestamp in frontmatter)
2. Copy plan → `plan.md` (append `## Archived` with date)
3. Delete originals

<!-- end:local -->
<!-- if:github -->

1. PRD issue: add `tk:done`, remove `tk:in-progress`, set metadata `status: done` + `completed` timestamp
2. Close PRD issue (reason: `completed`)
3. Close plan issue (reason: `completed`)
4. If current PR exists, reference it in closing comment on PRD issue

<!-- end:github -->

### 8. On `in_progress` (no blockers)

Show progress summary (checked/total per phase), list the next unchecked items to implement. Keep going.

### 9. On `in_progress` (with blockers)

List the blockers to fix, then re-run `/tk:check <slug>`.

## Rules

- The review subagent must be **read-only** — it must not create, edit, or delete any files
- The only file writes this skill makes are: checkboxes + verdict block in the plan, and the archive steps on `done`
- Never modify implementation code — only observe and report
- If the PRD file is missing but all checks pass, warn and proceed — archive the plan only (skip PRD steps in archive)
