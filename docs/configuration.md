# Configuration

TracerKit stores artifacts as local files by default. Storage is configured **per-project** -- each project can use a different backend. Skills are installed globally and resolve the storage backend at runtime by reading `.tracerkit/config.json` from the project root.

## Storage

Set `storage` to choose where PRDs, plans, and status live:

| Value               | Description                     |
| ------------------- | ------------------------------- |
| `"local"` (default) | Markdown files in `.tracerkit/` |
| `"github"`          | GitHub Issues with labels       |

### Via CLI

```bash
tracerkit config storage github        # set current project to GitHub
tracerkit config storage local         # switch back to local
```

The `config` command defaults to the current working directory, so it always sets per-project config.

### Via config file

Create or edit `.tracerkit/config.json` in the project root:

```json
{
  "storage": "github"
}
```

Skills read this file at runtime -- no re-rendering needed.

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

Any missing key falls back to its default. Skills read paths from this config via `{{paths.*}}` template variables. Existing artifacts are not moved. Rename them manually if needed.

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

- **`gh` CLI**: requires `gh auth login` with `repo` scope
- **GitHub MCP server**: requires the MCP server configured with appropriate token scopes

Required GitHub token scopes: `repo` (for private repos) or `public_repo` (for public repos).

### Labels

Skills create these labels automatically at runtime:

| Label            | Color  | Configurable | Purpose                       |
| ---------------- | ------ | ------------ | ----------------------------- |
| `tk:prd`         | green  | yes          | PRD issues                    |
| `tk:plan`        | blue   | yes          | Plan issues                   |
| `tk:created`     | yellow | no           | PRD written, no plan yet      |
| `tk:in-progress` | orange | no           | Plan generated, work underway |
| `tk:done`        | green  | no           | All checks verified           |

Override `tk:prd` and `tk:plan` via `github.labels.prd` and `github.labels.plan`. Status labels are managed by skills and cannot be renamed.

## Reading current config

```bash
tracerkit config                       # print project config as JSON
tracerkit config storage               # print specific key
tracerkit config github.repo           # print nested key
```

The `config` command always operates on the current working directory.
