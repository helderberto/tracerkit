# Plan: CLI init, update, uninstall

> Source PRD: `prds/cli-init.md`

## Architectural decisions

- **`templates/` is source of truth** — contains `.claude-plugin/` and `skills/` that get copied into target projects; top-level copies in the repo are removed in favor of `templates/`
- **Zero runtime deps** — Node 24 native TS stripping; `bin/cli.js` imports `src/cli.ts` directly
- **Content-hash diffing** — `update` uses file content hashes to detect user modifications; no lockfile
- **CLI dispatch** — `process.argv[2]` selects command; unknown or missing command prints usage

---

## Phase 1 — `npx tracerkit init` works end-to-end

**User stories**: 1, 2, 3, 12

### What to build

Move `.claude-plugin/` and `skills/` into `templates/`. Build TemplateEngine with `copyTemplates(targetDir): CopyResult` that discovers all files under `templates/` relative to the package root and copies them into the target directory. Build the `init` command that checks for existing `.claude-plugin/` or `skills/` (aborts if found) then delegates to `copyTemplates`. Wire up `src/cli.ts` to parse `process.argv` and dispatch to `init` or print usage. Update `bin/cli.js` to import `src/cli.ts`. Update `package.json` `files` array to include `templates/` and `src/`. Tests cover: fresh init copies all files, existing install aborts, unknown command prints usage, no command prints usage.

### Done when

`npx tracerkit init` in an empty temp dir creates `.claude-plugin/plugin.json` and all 4 `skills/*/SKILL.md`. Running again aborts with error message. Unknown command and no command both print usage. All vitest unit tests pass.

> Suggest running `/clear` before continuing to Phase 2.

---

## Phase 2 — `npx tracerkit update` with smart diffing

**User stories**: 4, 5, 6, 7, 8

### What to build

Add `diffTemplates(targetDir): DiffResult` to TemplateEngine — hashes each installed file against the package template, classifies as `unchanged`, `modified`, or `missing`. Build the `update` command: abort if not initialized (no `.claude-plugin/`), then diff, overwrite unchanged files, add missing files, skip modified files. Report all three categories to the user. Wire into CLI dispatcher. Tests cover: unchanged files overwritten, modified files skipped and reported, missing files added, not-initialized aborts.

### Done when

`update` on unmodified install refreshes all files. Modified files are skipped with `⚠` report. New template files not present locally are added. Running on a project without TracerKit aborts with error. All vitest unit tests pass.

> Suggest running `/clear` before continuing to Phase 3.

---

## Phase 3 — `npx tracerkit uninstall`

**User stories**: 9, 10, 11

### What to build

Build the `uninstall` command: abort if not initialized, then recursively remove `.claude-plugin/` and `skills/` directories. Leave `prds/`, `plans/`, and `archive/` untouched. Wire into CLI dispatcher. Tests cover: removes correct directories, leaves user artifacts, aborts if not installed.

### Done when

`uninstall` removes `.claude-plugin/` and `skills/`. `prds/`, `plans/`, `archive/` remain. Running on a project without TracerKit aborts with error. All vitest unit tests pass.

---

## Out of Scope

- No interactive prompts or skill selection
- No config file (`.tracerkitrc` or similar)
- No version pinning or lockfile for installed templates
- No colored output — plain text with symbol prefixes only
- `agents/` and `docs/` directories not part of init yet
- No `--force` flag to bypass conflict detection

## Open Questions

None.

## Archived

Archived on 2026-04-06.
