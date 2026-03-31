---
description: Compare implementation against plan, emit BLOCKERS/SUGGESTIONS and a ✅ PASS or 🚧 NEEDS_WORK verdict. Auto-archives on ✅ PASS. Use after implementing a plan.
argument-hint: '[slug]'
---

# Verify Implementation

Compare current implementation against a plan, stamp a verdict, and archive on ✅ PASS.

## Pre-loaded context

- Available plans: !`ls {{paths.plans}}/ 2>/dev/null || echo "no {{paths.plans}}/ directory found"`

## Input

The argument (if provided) is: $ARGUMENTS

Use the argument as `<slug>` if given. If no argument is provided, list available plans and ask which one to verify.

## Workflow

### 1. Load the plan

Read `{{paths.plans}}/<slug>.md`. If it does not exist, list available plans and ask.

### 2. Load the PRD

Read the source PRD referenced in the plan header (`> Source PRD: ...`).

### 3. Launch read-only review

Use a **read-only subagent** (no file writes, no edits) to:

1. Read every section of the plan — architectural decisions, each phase, done-when conditions
2. For each phase, explore the codebase to verify the done-when condition is satisfied
3. Run any test commands referenced in the plan or discoverable via project conventions
4. Compare user stories from the PRD against actual behavior

Collect findings into two categories:

- **BLOCKERS** — done-when conditions not met, missing functionality, failing tests, broken contracts. These prevent a ✅ PASS.
- **SUGGESTIONS** — improvements, minor gaps, style issues. These do not prevent a ✅ PASS.

### 4. Determine verdict

- **✅ PASS** — zero BLOCKERS
- **🚧 NEEDS_WORK** — one or more BLOCKERS

### 5. Report to user

Print the verdict report:

```
## Verification: <slug>

### Verdict: ✅ PASS | 🚧 NEEDS_WORK

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

- **Result**: ✅ PASS | 🚧 NEEDS_WORK
- **Date**: YYYY-MM-DD
- **BLOCKERS**: (count)
- **SUGGESTIONS**: (count)
```

If a previous verdict block exists, replace it with the new one.

### 7. On ✅ PASS — update PRD status and archive

If the verdict is **✅ PASS**:

**First**, update the YAML frontmatter in `{{paths.prds}}/<slug>.md`:

- Set `status: done`
- Add `completed: <current UTC timestamp, ISO 8601, e.g. 2025-06-15T14:30:00Z>`
- Do not touch any other frontmatter fields or the markdown content below the closing `---`
- If the PRD has no frontmatter, skip frontmatter update silently

**Then**, automatically archive:

1. Create `{{paths.archives}}/<slug>/` directory (and `{{paths.archives}}/` if missing)
2. Move `{{paths.prds}}/<slug>.md` → `{{paths.archives}}/<slug>/prd.md`
3. Move `{{paths.plans}}/<slug>.md` → `{{paths.archives}}/<slug>/plan.md`
4. Append closing timestamp to `{{paths.archives}}/<slug>/plan.md`:

```markdown
---

## Archived

- **Status**: closed
- **Closed**: YYYY-MM-DD HH:MM (UTC)
```

5. Tell the user: archived to `{{paths.archives}}/<slug>/`, one-line summary of the feature.

If `{{paths.archives}}/<slug>/` already exists, warn and ask whether to overwrite.

### 8. On 🚧 NEEDS_WORK

Tell the user: fix the listed blockers, then re-run `/tk:verify <slug>`.

## Rules

- The review subagent must be **read-only** — it must not create, edit, or delete any files
- The only file writes this skill makes are: the verdict block in the plan, and the archive move on ✅ PASS
- Never modify the source PRD (except moving it to archive)
- Never modify implementation code — only observe and report
- If the PRD file is missing but the plan has a ✅ PASS verdict, warn but proceed with archiving the plan only

## Error Handling

- Plan not found — list available plans and ask
- PRD referenced in plan not found — warn and continue with plan only
- `{{paths.plans}}/` missing — tell user to run `/tk:plan` first
- `{{paths.archives}}/<slug>/` already exists — warn and ask whether to overwrite
