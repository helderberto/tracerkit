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

Any missing key falls back to its default. The file is optional; without it, all defaults apply. After changing config, run `tracerkit update` to regenerate skills with the new paths.
