# Metadata Lifecycle

Each PRD carries YAML frontmatter that tracks its position in the workflow. The skills update it automatically. You never need to edit it by hand.

## Statuses

TracerKit uses three statuses across the entire workflow:

| Status        | Set by      | Meaning                                 |
| ------------- | ----------- | --------------------------------------- |
| `created`     | `/tk:prd`   | PRD written, no plan yet                |
| `in_progress` | `/tk:plan`  | Plan generated, implementation underway |
| `done`        | `/tk:check` | All checks verified, archived           |

These are the only statuses in TracerKit. The same vocabulary is used in PRD frontmatter, the feature dashboard, and check reports.

## Fields

- `created`: ISO 8601 UTC timestamp, set when the PRD is written
- `status`: `created` | `in_progress` | `done`
- `completed`: ISO 8601 UTC timestamp, set when all checks pass

## How it changes

| Stage              | Skill       | Frontmatter                                          |
| ------------------ | ----------- | ---------------------------------------------------- |
| Defined            | `/tk:prd`   | `created: 2025-06-15T14:30:00Z`<br>`status: created` |
| Planning           | `/tk:plan`  | `status: in_progress`                                |
| Checked (partial)  | `/tk:check` | no change (stays `in_progress`)                      |
| Checked (all pass) | `/tk:check` | `status: done`<br>`completed: 2025-06-20T09:00:00Z`  |

## Examples

After `/tk:prd`:

```yaml
---
created: 2025-06-15T14:30:00Z
status: created
---
```

After `/tk:plan`:

```yaml
---
created: 2025-06-15T14:30:00Z
status: in_progress
---
```

After `/tk:check` (partial -- still working):

```yaml
---
created: 2025-06-15T14:30:00Z
status: in_progress
---
```

After `/tk:check` (all checks pass):

```yaml
---
created: 2025-06-15T14:30:00Z
status: done
completed: 2025-06-20T09:00:00Z
---
```

## Plan checks

The plan file uses markdown checkboxes as progress markers:

```markdown
### Done when

- [x] Migration creates revenue table
- [x] GET /api/revenue returns data
- [ ] Revenue component renders table
- [ ] Tests pass for service + API + component
```

The agent marks `[x]` during implementation. `/tk:check` verifies each item against the codebase and updates them. Progress is reported as checked/total (e.g. "2/4").
