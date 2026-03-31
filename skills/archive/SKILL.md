---
description: Archive a completed PRD and plan after a PASS verdict. Use after /tk:verify passes.
argument-hint: '[slug]'
disable-model-invocation: true
---

# Archive Completed Work

Move a completed PRD and plan to the archive with a closing timestamp.

## Pre-loaded context

- Available plans: !`ls plans/ 2>/dev/null || echo "no plans/ directory found"`

## Input

The argument (if provided) is: $ARGUMENTS

Use the argument as `<slug>` if given. If no argument is provided, list available plans and ask which one to archive.

## Workflow

### 1. Load the plan

Read `plans/<slug>.md`. If it does not exist, list available plans and ask.

### 2. Check verdict

Look for the `## Verdict` section at the bottom of the plan.

- If **no verdict found** — stop. Tell the user: "No verdict found. Run `/tk:verify <slug>` first."
- If verdict is **NEEDS_WORK** — stop. Tell the user: "Verdict is NEEDS_WORK. Fix blockers and re-run `/tk:verify <slug>`."
- If verdict is **PASS** — continue.

### 3. Archive

Create `archive/` directory if missing.

Move both files:

- `prds/<slug>.md` → `archive/<slug>/prd.md`
- `plans/<slug>.md` → `archive/<slug>/plan.md`

### 4. Stamp closing timestamp

Append to `archive/<slug>/plan.md`:

```markdown
---

## Archived

- **Closed**: YYYY-MM-DD HH:MM (UTC)
```

### 5. Confirm

Tell the user: archived to `archive/<slug>/`, one-line summary of the feature.

## Rules

- Never archive without a PASS verdict
- Never modify implementation code
- If the PRD file is missing but the plan has a PASS verdict, warn but proceed with archiving the plan only

## Error Handling

- Plan not found — list available plans and ask
- No verdict section — tell user to run `/tk:verify` first
- NEEDS_WORK verdict — tell user to fix blockers first
- `archive/` missing — create it
- `archive/<slug>/` already exists — warn and ask whether to overwrite
