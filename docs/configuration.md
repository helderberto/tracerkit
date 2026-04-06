# Configuration

TracerKit stores artifacts as local files by default. You can switch to GitHub Issues as the storage backend, or customize local paths.

## Storage

Set `storage` to choose where PRDs, plans, and status live:

| Value               | Description                     |
| ------------------- | ------------------------------- |
| `"local"` (default) | Markdown files in `.tracerkit/` |
| `"github"`          | GitHub Issues with labels       |

### Via CLI

```bash
tracerkit init --storage github        # first install with GitHub
tracerkit config storage github        # switch existing install
tracerkit config storage local         # switch back
```

### Via config file

Create or edit `.tracerkit/config.json`:

```json
{
  "storage": "github"
}
```

Then run `tracerkit update --force` to re-render skills.

## GitHub options

When `storage` is `"github"`, you can configure:

```json
{
  "storage": "github",
  "github": {
    "repo": "owner/repo",
    "labels": {
      "prd": "tk:prd",
      "plan": "tk:plan"
    }
  }
}
```

| Key                  | Default                       | Description                                     |
| -------------------- | ----------------------------- | ----------------------------------------------- |
| `github.repo`        | auto-detected from git remote | Explicit `owner/repo` for the target repository |
| `github.labels.prd`  | `tk:prd`                      | Label for PRD issues                            |
| `github.labels.plan` | `tk:plan`                     | Label for plan issues                           |

```bash
tracerkit config github.repo org/repo  # set explicit repo
```

### GitHub permissions

The agent needs permission to create, edit, and close issues. This works via:

- **`gh` CLI** — requires `gh auth login` with `repo` scope
- **GitHub MCP server** — requires the MCP server configured with appropriate token scopes

Required GitHub token scopes: `repo` (for private repos) or `public_repo` (for public repos).

### Labels

TracerKit uses these labels (created automatically by skills at runtime):

| Label            | Color  | Purpose                       |
| ---------------- | ------ | ----------------------------- |
| `tk:prd`         | green  | PRD issues                    |
| `tk:plan`        | blue   | Plan issues                   |
| `tk:created`     | yellow | PRD written, no plan yet      |
| `tk:in-progress` | orange | Plan generated, work underway |
| `tk:done`        | green  | All checks verified           |

## Local paths

When `storage` is `"local"` (default), customize file paths:

```json
{
  "paths": {
    "prds": ".tracerkit/prds",
    "plans": ".tracerkit/plans",
    "archives": ".tracerkit/archives"
  }
}
```

Any missing key falls back to its default. Skills read paths from this config via `{{paths.*}}` template variables. Existing artifacts are not moved — rename them manually if needed.

## Reading current config

```bash
tracerkit config                       # print full config as JSON
tracerkit config storage               # print specific key
tracerkit config github.repo           # print nested key
```
