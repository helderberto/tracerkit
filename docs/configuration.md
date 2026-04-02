# Configuration

Artifacts are stored under `.tracerkit/` by default. To customize paths, create `.tracerkit/config.json`:

```json
{
  "paths": {
    "prds": ".tracerkit/prds",
    "plans": ".tracerkit/plans",
    "archives": ".tracerkit/archives"
  }
}
```

Any missing key falls back to its default. The file is optional; without it, all defaults apply.

Skills read paths from this config at runtime via `{{paths.*}}` template variables. Existing artifacts are not moved — rename them manually if needed.
