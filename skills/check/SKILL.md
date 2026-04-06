---
description: Verify implementation against plan. Shows progress, finds blockers, and archives when done. Use after implementing a plan, or without arguments to see a feature dashboard.
argument-hint: '[slug]'
---

## Storage

Read `.tracerkit/config.json` in the project root. If absent, use `local`.

- **`local`** (default): follow `<!-- if:local -->` blocks, ignore `<!-- if:github -->` blocks
- **`github`**: follow `<!-- if:github -->` blocks, ignore `<!-- if:local -->` blocks. Use `github.repo` from config (or auto-detect from git remote). Labels default to `tk:prd`/`tk:plan` but may be overridden in config.

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

After the table, ask which feature to verify.

## Progress Algorithm

To count progress for a plan file:

1. Find every `## Phase N` heading (regex: `^## Phase \d+`)
2. Within each phase section (until the next `## ` heading), count:
   - Checked: lines matching `^- \[x\] ` (case-insensitive)
   - Unchecked: lines matching `^- \[ \] `
3. Per-phase output: `  Phase N — title: checked/total`
4. Sum across all phases → `Total: checked/total`

## Workflow

### 1. Load the plan

<!-- if:local -->

Read `.tracerkit/plans/<slug>.md`. If it does not exist, list available plans and ask.

<!-- end:local -->
<!-- if:github -->

Find the plan issue: search for an open GitHub Issue with label `{{github.labels.plan}}` and title matching `[{{github.labels.plan}}] <slug>:`. Read its body. If not found, list available plan issues and ask.

<!-- end:github -->

### 2. Load the PRD

<!-- if:local -->

Read the source PRD referenced in the plan header (`> Source PRD: ...`).

<!-- end:local -->
<!-- if:github -->

Read the source PRD issue referenced in the plan body (`> Source PRD: #<number>`).

<!-- end:github -->

### 3. Fast-path: check if implementation exists

Before launching a subagent, check whether the primary module file(s) from Phase 1 exist. If none exist, skip the subagent entirely and report `0/N — not yet started`. List Phase 1's "Done when" items as next steps and jump to Step 5.

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

Count progress per phase using the Progress Algorithm above, then print the verdict report:

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

Perform these steps in order:

1. Create directory `.tracerkit/archives/<slug>/`
2. If `.tracerkit/prds/<slug>.md` exists:
   - Read the PRD file
   - In the YAML frontmatter (between `---` fences), find the `status:` line and replace its value with `done`. If no `status:` line exists, add `status: done` as a new line inside the frontmatter block.
   - Add a `completed: <current UTC ISO 8601 timestamp>` line inside the frontmatter block (e.g. `completed: 2025-06-15T14:30:00Z`)
   - Write the updated content to `.tracerkit/archives/<slug>/prd.md`
3. Read `.tracerkit/plans/<slug>.md`
   - Append to the end: `\n## Archived\n\nArchived on YYYY-MM-DD.\n`
   - Write the result to `.tracerkit/archives/<slug>/plan.md`
4. Delete `.tracerkit/prds/<slug>.md` (if it exists)
5. Delete `.tracerkit/plans/<slug>.md`

Tell the user: archived to `.tracerkit/archives/<slug>/`, one-line summary of the feature.

<!-- end:local -->
<!-- if:github -->

Perform these steps in order:

1. Update the PRD issue:
   - Add `tk:done` label, remove `tk:in-progress` label
   - Update the `<!-- tk:metadata -->` comment: set `status: done`, add `completed: <current UTC ISO 8601 timestamp>`
2. Close the PRD issue with reason `completed`
3. Close the plan issue with reason `completed`
4. If there is a current PR associated with this work, reference it in a closing comment on the PRD issue

Tell the user: issues closed (include issue numbers), one-line summary of the feature.

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

## Error Handling

- Plan not found — list available plans and ask
- PRD referenced in plan not found — warn and continue with plan checks only
<!-- if:local -->
- `.tracerkit/plans/` missing — tell user to run `/tk:plan` first
- `.tracerkit/archives/<slug>/` already exists — warn and ask whether to remove it first
  <!-- end:local -->
  <!-- if:github -->
- Issue update fails — report the error and suggest checking `gh auth status`
<!-- end:github -->
