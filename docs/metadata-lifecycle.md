# Metadata Lifecycle

Each PRD carries YAML frontmatter that tracks its position in the workflow. The skills update it automatically. You never need to edit it by hand.

## Fields

- `created`: ISO 8601 UTC timestamp, set when the PRD is written
- `status`: `created` | `in_progress` | `done`
- `completed`: ISO 8601 UTC timestamp, set when verification passes

## How it changes

| Stage    | Skill                  | Frontmatter                                          |
| -------- | ---------------------- | ---------------------------------------------------- |
| Defined  | `/tk:prd`              | `created: 2025-06-15T14:30:00Z`<br>`status: created` |
| Planning | `/tk:plan`             | `status: in_progress`                                |
| Verified | `/tk:verify` (✅ PASS) | `status: done`<br>`completed: 2025-06-20T09:00:00Z`  |

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

After `/tk:verify` (✅ PASS):

```yaml
---
created: 2025-06-15T14:30:00Z
status: done
completed: 2025-06-20T09:00:00Z
---
```
