---
description: Session briefing — shows active features, progress, and suggested focus. Use at the start of a session to orient.
---

## Storage

Read `.tracerkit/config.json` in the project root. If absent, use `local`.

- **`local`** (default): follow `<!-- if:local -->` blocks, ignore `<!-- if:github -->` blocks
- **`github`**: follow `<!-- if:github -->` blocks, ignore `<!-- if:local -->` blocks. Use `github.repo` from config (or auto-detect from git remote). Labels default to `tk:prd`/`tk:plan` but may be overridden in config.

# Session Briefing

Get a quick overview of all active features, their progress, and what to focus on next.

## Pre-loaded context

<!-- if:local -->

- Available PRDs: !`ls .tracerkit/prds/ 2>&1`
  <!-- end:local -->
  <!-- if:github -->
- Available PRDs: list open GitHub Issues with label `{{github.labels.prd}}`
<!-- end:github -->

## Algorithm

Follow these steps exactly to build the briefing table:

### 1. Discover features

<!-- if:local -->

For each `.md` file in `.tracerkit/prds/`:

1. Read the file
2. Parse YAML frontmatter (the block between `---` fences at the top)
3. Extract `status` and `created` fields
4. Skip files where `status: done`
5. The slug is the filename without `.md`
   <!-- end:local -->
   <!-- if:github -->

   List open GitHub Issues with label `{{github.labels.prd}}`:

6. For each issue, parse the `<!-- tk:metadata -->` comment in the body
7. Extract `status` and `created` fields from the metadata
8. Also check labels: `tk:created`, `tk:in-progress`
9. Skip issues with `tk:done` label
10. The slug is extracted from the title: `[{{github.labels.prd}}] <slug>: ...`
<!-- end:github -->

### 2. Count progress from plans

<!-- if:local -->

For each slug, check if `.tracerkit/plans/<slug>.md` exists. If it does:

1. Read the plan file
2. Find every `## Phase N` heading (regex: `^## Phase \d+`)
3. Within each phase section (until the next `## ` heading), count:
   - Checked items: lines matching `^- \[x\] ` (case-insensitive)
   - Unchecked items: lines matching `^- \[ \] `
4. Sum checked and total across all phases → `checked/total`
5. Find the first unchecked item (`^- \[ \] (.+)`) in the entire plan — that's the "Next" value. Strip any trailing `[tag]` markers.

If no plan exists, progress is `—` and next is `—`.

<!-- end:local -->
<!-- if:github -->

For each slug, search for a GitHub Issue with label `{{github.labels.plan}}` and title matching `[{{github.labels.plan}}] <slug>:`. If found:

1. Read the plan issue body
2. Find every `## Phase N` heading (regex: `^## Phase \d+`)
3. Within each phase section (until the next `## ` heading), count:
   - Checked items: lines matching `^- \[x\] ` (case-insensitive)
   - Unchecked items: lines matching `^- \[ \] `
4. Sum checked and total across all phases → `checked/total`
5. Find the first unchecked item (`^- \[ \] (.+)`) in the entire plan — that's the "Next" value. Strip any trailing `[tag]` markers.

If no plan issue exists, progress is `—` and next is `—`.

<!-- end:github -->

### 3. Build the table

Sort features by `created` date ascending (no-date entries last). Calculate age from `created`:

- < 7 days → `Nd` (e.g. `3d`)
- < 30 days → `Nw` (e.g. `2w`)
- 30+ days → `Nmo` (e.g. `1mo`)

Output this exact table format:

```
| Feature | Status | Age | Progress | Next |
|---------|--------|-----|----------|------|
| <slug>  | <status> | <age> | <checked>/<total> | <next item> |
```

If no features found, output: `No features found — run /tk:prd to start one.`

### 4. Determine focus

Apply these rules in order:

1. Exactly 1 feature with `status: in_progress` → auto-select it
2. Multiple `in_progress` features → select the oldest by `created`
3. Zero `in_progress` features → select the oldest overall

Append below the table:

```
**Focus → <slug>**
```

### 5. Offer next steps

Ask the user what they'd like to do:

<!-- if:local -->

- Continue the focused feature (read its plan at `.tracerkit/plans/<slug>.md`)
  <!-- end:local -->
  <!-- if:github -->
- Continue the focused feature (read its plan issue)
<!-- end:github -->
- Start a new feature with `/tk:prd`
- Check progress on a feature with `/tk:check <slug>`
