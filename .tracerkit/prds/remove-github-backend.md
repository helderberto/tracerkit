---
created: 2026-04-10T00:00:00Z
status: done
completed: 2026-04-10T18:35:00Z
plan: .tracerkit/plans/remove-github-backend.md
---

# Remove GitHub Issues Backend

## Problem Statement

TracerKit skills contain conditional blocks (`<!-- if:local -->` / `<!-- if:github -->`) that instruct the LLM to read `.tracerkit/config.json` and follow the matching branch. When installed via Claude Code plugin marketplace, skills are served raw (no template rendering). The LLM sees both branches and fails to follow the correct one — proven by creating a local PRD when config says `storage: "github"`.

The GitHub Issues backend is responsible for ~80% of project complexity: CLI config system, template rendering, conditional blocks in all 5 skills, migrate-storage command, and ~19 template variable occurrences. This complexity exists to serve a use case that git already solves (PRDs/plans are markdown files, trackable via commits and PRs).

## Current State

- 5 skills with ~50 conditional markers across them
- `renderTemplate()` substitutes `{{github.labels.*}}` vars but does NOT strip conditional blocks
- Config system (`config.ts`) manages storage backend, paths, GitHub labels
- `migrate-storage` command converts between local and GitHub Issues
- CLI commands: `init`, `update`, `uninstall`, `config`, `migrate-storage`
- Plugin marketplace serves skills raw from `./skills` directory

## Solution

Remove the GitHub Issues storage backend entirely. Skills become pure markdown with no conditional blocks or template variables. The CLI is simplified (keeps init/update/uninstall) but loses config and migrate-storage.

User experience after:

- Skills work identically whether installed via CLI or plugin marketplace
- No config file needed — artifacts always live in `.tracerkit/prds/` and `.tracerkit/plans/`
- README leads with Claude Code marketplace install; CLI install in collapsed section

## User Stories

1. User installs via marketplace and runs `/tk:prd` — skill reads cleanly, creates PRD in `.tracerkit/prds/` without ambiguity
2. User installs via `npm install -g tracerkit && tracerkit init` — same skills copied to `~/.claude/skills/`, same behavior
3. User runs `tracerkit update` — skills updated via SHA256 diff, no config dependency
4. Existing user with `storage: "github"` in config — config file is ignored, local storage used; migration docs explain how to manually copy GitHub Issues to local files
5. User on Cursor/Copilot/Gemini — copies plain markdown skills, no conditional blocks to confuse the agent

## Implementation Decisions

### Removed Modules

- `src/config.ts` — entire file deleted; no config system needed
- `src/commands/config.ts` — entire file deleted
- `src/commands/migrate-storage.ts` — entire file deleted
- Template variable substitution in `src/templates.ts` (`renderTemplate` function)

### Simplified Modules

**`src/templates.ts`**

- Remove `renderTemplate()` — files copied as-is, no substitution
- `copyTemplates(targetDir)` and `diffTemplates(targetDir)` lose the `config` parameter
- SHA256 diff logic stays (needed for smart update)

**`src/commands/init.ts`**

- Remove `loadConfig` call
- `init(cwd)` copies skills directly

**`src/commands/update.ts`**

- Remove `loadConfig` call
- `update(cwd, opts)` diffs and copies without config

**`src/cli.ts`**

- Remove `config` and `migrate-storage` switch cases
- Remove config-related imports
- Simplify help text

**`src/constants.ts`**

- Remove config-related constants if any
- Add `config` and `migrate-storage` to deprecated commands list

### Skill Files (all 5)

For each skill in `skills/`:

- Remove all `<!-- if:local -->` / `<!-- end:local -->` markers (keep content inside)
- Remove all `<!-- if:github -->` ... `<!-- end:github -->` blocks entirely (content and markers)
- Remove all `{{github.labels.*}}` template variables
- Remove the "**Config**: read `.tracerkit/config.json`..." preamble line
- Keep only the local-path instructions

### Documentation Updates

**README.md:**

- Claude Code marketplace install as primary (open, not in details)
- CLI install in `<details>` collapsed section
- Remove "GitHub Issues as storage backend" section
- Remove `tracerkit config` examples
- Remove `tracerkit migrate-storage` references
- Update skills table if needed

**Docs to update:**

- `docs/cli-reference.md` — remove config and migrate-storage commands
- `docs/configuration.md` — remove or replace with note about removal
- `docs/metadata-lifecycle.md` — simplify to local-only lifecycle
- `docs/examples.md` — remove GitHub Issues examples
- `docs/comparison.md` — update if it references GitHub backend

**Docs for other agents:**

- `docs/cursor-setup.md` — no conditional blocks to mention
- `docs/copilot-setup.md` — same
- `docs/gemini-cli-setup.md` — same
- `docs/opencode-setup.md` — same

### Migration Guide

Add a short section in README or docs for existing GitHub Issues users:

- TracerKit no longer supports GitHub Issues as storage backend
- To migrate: copy issue body content to `.tracerkit/prds/<slug>.md` and `.tracerkit/plans/<slug>.md`
- Add frontmatter with `status` field

## Testing Decisions

- Remove all tests for `config.ts`, `config` command, `migrate-storage` command
- Update `templates.test.ts` — remove conditional block preservation tests, add tests for raw copy behavior
- Update `init.test.ts` and `update.test.ts` — remove config-dependent assertions
- Verify skills contain no conditional markers or template variables after cleanup
- Add test: copied skill content matches source exactly (no transformation)

## Out of Scope

- Removing the CLI entirely (separate decision, may keep for non-AI-tool users)
- Adding new storage backends
- Changing skill file format or frontmatter schema
- Modifying the plugin marketplace distribution mechanism
