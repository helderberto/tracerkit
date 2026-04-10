# Metadata Lifecycle

Each PRD carries YAML frontmatter that tracks its position in the workflow. The skills update it automatically. You never need to edit it by hand.

## Statuses

TracerKit uses three statuses across the entire workflow:

| Status        | Set by      | Meaning                                 |
| ------------- | ----------- | --------------------------------------- |
| `created`     | `/tk:prd`   | PRD written, no plan yet                |
| `in_progress` | `/tk:plan`  | Plan generated, implementation underway |
| `done`        | `/tk:check` | All checks verified, marked complete    |

These are the only statuses in TracerKit. The same vocabulary appears in the feature dashboard and check reports regardless of backend.

- **Local storage**: statuses live in PRD frontmatter fields
- **GitHub storage**: statuses map to issue labels (`tk:created`, `tk:in-progress`, `tk:done`)

## Fields

### Local (frontmatter)

- `created`: ISO 8601 UTC timestamp, set when the PRD is written
- `status`: `created` | `in_progress` | `done`
- `completed`: ISO 8601 UTC timestamp, set when all checks pass

### GitHub (issue metadata)

- **Created timestamp**: the issue's creation date
- **Status**: represented by labels (`tk:created`, `tk:in-progress`, `tk:done`)
- **Completed timestamp**: the issue's closed date

## How it changes

| Stage              | Skill       | Frontmatter                                          |
| ------------------ | ----------- | ---------------------------------------------------- |
| Defined            | `/tk:prd`   | `created: 2025-06-15T14:30:00Z`<br>`status: created` |
| Planning           | `/tk:plan`  | `status: in_progress`                                |
| Implementation     | `/tk:build` | no change (stays `in_progress`)                      |
| Checked (partial)  | `/tk:check` | no change (stays `in_progress`)                      |
| Checked (all pass) | `/tk:check` | `status: done`<br>`completed: 2025-06-20T09:00:00Z`  |

## Example

A single PRD's frontmatter evolves as skills run:

```text
---
created: 2025-06-15T14:30:00Z        # set by /tk:prd
status: created                       # → in_progress (by /tk:plan)
                                      # → done        (by /tk:check, all pass)
completed: 2025-06-20T09:00:00Z      # set by /tk:check when done
---
```

Partial checks (`/tk:check` with remaining items) leave `status: in_progress` unchanged.

## How it changes (GitHub)

When using GitHub Issues, the same transitions apply via labels instead of frontmatter:

| Stage              | Label change                             |
| ------------------ | ---------------------------------------- |
| Defined            | Issue created with `tk:created` label    |
| Planning           | Label changed to `tk:in-progress`        |
| Checked (all pass) | Label changed to `tk:done`, issue closed |

On `done`, GitHub mode also:

1. Opens (or updates) a PR with `Closes` references to both issues
2. Searches merged PRs matching the slug and links them via comments
3. Closes both issues with reason `completed`

## Plan frontmatter

Plans also carry frontmatter linking back to the PRD:

```text
---
source_prd: .tracerkit/prds/dark-mode-support.md
slug: dark-mode-support
status: in_progress
---
```

- `source_prd`: path (local) or issue reference (GitHub) to the parent PRD
- `slug`: explicit slug for stable cross-referencing
- `status`: mirrors the PRD status (`in_progress` or `done`)
- `completed`: ISO 8601 UTC timestamp, set alongside the PRD when all checks pass

## Plan checks

The plan file uses markdown checkboxes as progress markers:

```markdown
### Done when

- [x] Migration creates revenue table
- [x] GET /api/revenue returns data
- [ ] Revenue component renders table
- [ ] Tests pass for service + API + component
```

`/tk:build` marks `[x]` during implementation. `/tk:check` verifies each item against the codebase and updates them. Progress is reported as checked/total (e.g. "2/4").
