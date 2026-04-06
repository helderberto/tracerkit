---
description: Session briefing — shows active features, progress, and suggested focus. Use at the start of a session to orient.
---

**Config**: read `.tracerkit/config.json` (default: `local`). Follow matching `<!-- if:local/github -->` blocks. GitHub: use `github.repo` from config or git remote.

# Session Briefing

Overview of active features, progress, and suggested focus.

## Pre-loaded context

<!-- if:local -->

- Available PRDs: !`ls .tracerkit/prds/ 2>&1`
  <!-- end:local -->
  <!-- if:github -->
- Available PRDs: list open GitHub Issues with label `{{github.labels.prd}}`
<!-- end:github -->

## Algorithm

### 1. Discover features

<!-- if:local -->

For each `.md` file in `.tracerkit/prds/`: parse frontmatter, extract `status` and `created`. Skip `status: done`. Slug = filename without `.md`.

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

For each slug with a plan at `.tracerkit/plans/<slug>.md`:

Count `- [x]` and `- [ ]` lines under each `## Phase N` heading. Sum → `checked/total`. First unchecked item → "Next" (strip trailing `[tag]`). No plan → `—`.

<!-- end:local -->
<!-- if:github -->

For each slug, find plan issue with label `{{github.labels.plan}}` and matching title. If found:

Count `- [x]` and `- [ ]` lines under each `## Phase N` heading. Sum → `checked/total`. First unchecked item → "Next" (strip trailing `[tag]`). No plan → `—`.

<!-- end:github -->

### 3. Build the table

Sort by `created` ascending (no-date last). Age from `created`:

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

<!-- if:local -->

Options: continue focused feature (read plan at `.tracerkit/plans/<slug>.md`), `/tk:prd` for new feature, `/tk:check <slug>` for progress.

<!-- end:local -->
<!-- if:github -->

Options: continue focused feature (read plan issue), `/tk:prd` for new feature, `/tk:check <slug>` for progress.

<!-- end:github -->
