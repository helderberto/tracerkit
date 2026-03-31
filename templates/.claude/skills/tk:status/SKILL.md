---
description: Show a dashboard of all features and their workflow status. Use any time to check progress.
---

# Workflow Dashboard

Scan all PRDs and display a status overview of every feature in the workflow.

## Workflow

### 1. Scan PRDs

List all `.md` files in `prds/`. If the directory is missing or empty, print "No features found — run `/tk:prd` to start one." and stop.

### 2. Parse each PRD

For each file `prds/<slug>.md`:

1. Read YAML frontmatter (between opening and closing `---` delimiters)
2. Extract fields: `created`, `status`, `completed`
3. If no frontmatter exists, treat as `status: unknown` with no age

### 3. Read verdict data

For each slug, check if `plans/<slug>.md` exists. If it does, find the last `## Verdict` block and extract:

- **Result**: PASS or NEEDS_WORK
- **BLOCKERS**: count
- **SUGGESTIONS**: count

If no plan or no verdict block exists, leave verdict columns blank.

### 4. Print the table

Group features by status in this order: `in_progress`, `created`, `done`, `unknown`.

Within each group, sort by `created` date (oldest first). Features without a `created` date sort last.

Print a markdown table:

```
## Workflow Dashboard

| Feature | Status | Age | Verdict | Blockers | Suggestions |
|---------|--------|-----|---------|----------|-------------|
| <slug>  | ...    | ... | ...     | ...      | ...         |
```

Column definitions:

- **Feature**: the slug (filename without `.md`)
- **Status**: `created`, `in_progress`, `done`, or `unknown`
- **Age**: human-readable duration since `created` (e.g. "3d", "2w", "1mo") — blank if no `created`
- **Verdict**: latest verdict result or blank
- **Blockers**: blocker count from latest verdict or blank
- **Suggestions**: suggestion count from latest verdict or blank

After the table, print a one-line summary: `N features: X in progress, Y created, Z done`.

## Rules

- Read-only — this skill must not create, edit, or delete any files
- Graceful degradation for missing frontmatter, missing plans, or missing verdicts
- No arguments accepted — always scans all PRDs
