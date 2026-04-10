---
source_prd: .tracerkit/prds/remove-github-backend.md
slug: remove-github-backend
status: in_progress
---

# Plan: Remove GitHub Issues Backend

> Source PRD: `.tracerkit/prds/remove-github-backend.md`

## Architectural Decisions

Durable decisions that apply across all phases:

- **Artifact paths**: always `.tracerkit/prds/` and `.tracerkit/plans/` — hardcoded, no config
- **Skill format**: YAML frontmatter + markdown body — unchanged
- **CLI interface**: `init [path]`, `update [path] [--force]`, `uninstall [path]` — same signatures, no config param
- **Plugin distribution**: `plugin.json` → `./skills` — unchanged
- **SHA256 diff**: stays for smart update detection in `update` command
- **Future**: GitHub Issues integration may return as a separate feature; do not leave scaffolding or hooks for it

---

## Phase 1 — Skills serve clean markdown

**User stories**: 1 (marketplace install works cleanly), 5 (Cursor/Copilot/Gemini get plain markdown)

### What to build

Strip all conditional blocks and template variables from the 5 skill files so they contain only local-path instructions. Simplify `templates.ts` to copy files as-is (no `renderTemplate`). Update template tests to verify raw copy behavior.

### Done when

- [x] No skill file in `skills/` contains `<!-- if:` or `<!-- end:` markers — `grep -r '<!-- if:\|<!-- end:' skills/` returns nothing
- [x] No skill file contains `{{github.labels` — `grep -r '{{github.labels' skills/` returns nothing
- [x] No skill file contains the config preamble line `**Config**: read` — `grep -r 'Config.*config.json' skills/` returns nothing
- [x] `renderTemplate` function removed from `src/templates.ts`
- [x] `copyTemplates` and `diffTemplates` no longer accept a `config` parameter
- [x] `src/templates.test.ts` passes — conditional block tests replaced with raw-copy tests
- [x] Copied skill content matches source exactly (no transformation) — verified by test

---

## Phase 1b — Improve skill quality

**User stories**: 1 (skills work cleanly), 5 (agents follow instructions correctly)

### What to build

Now that skills are pure local-only markdown, improve them across all 5 files:

- **Clareza**: rewrite sections that were confusing due to conditional blocks; simplify language
- **Reduzir tokens**: remove redundancy that existed to support two paths; make skills more concise
- **Robustez**: make instructions more assertive so LLMs follow correctly (output format, edge cases)
- **Menus agnosticos**: wherever the skill asks for user input, use numbered option lists (`1. Option A (Recommended) / 2. Option B`) with explicit "present options and wait for choice" — no tool-specific references (no `AskUserQuestion`, no tool names). Works across Claude Code, Cursor, Copilot, Gemini, and any agent.

### Done when

- [x] All 5 skills reviewed and improved — `skills/{brief,prd,plan,build,check}/SKILL.md`
- [x] No skill references agent-specific tools for user interaction (no `AskUserQuestion`, no `AskUser`) — `grep -ri 'AskUser' skills/` returns nothing
- [x] All interactive prompts use numbered option lists with `(Recommended)` marker on default choice
- [x] Each skill has explicit "present options and wait for choice" pattern for user decisions
- [x] Token count reduced — each skill file is shorter than its pre-cleanup version
- [x] Skills reviewed with `/revise` for prose quality

---

## Phase 2 — CLI works without config system

**User stories**: 2 (CLI install works), 3 (update works without config), 4 (existing github config users get deprecation)

### What to build

Remove config module, config command, and migrate-storage command. Simplify init/update/uninstall to work without config. Add `config` and `migrate-storage` to deprecated commands list so existing users get a clear message.

### Done when

- [x] `src/config.ts` deleted
- [x] `src/commands/config.ts` deleted
- [x] `src/commands/migrate-storage.ts` deleted
- [x] `src/config.test.ts` deleted
- [x] `src/commands/config.test.ts` deleted
- [x] `src/commands/migrate-storage.test.ts` deleted
- [x] `src/commands/init.ts` has no `loadConfig` import — `grep 'loadConfig' src/commands/init.ts` returns nothing
- [x] `src/commands/update.ts` has no `loadConfig` import — `grep 'loadConfig' src/commands/update.ts` returns nothing
- [x] `src/constants.ts` lists `config` and `migrate-storage` as deprecated commands
- [x] `tracerkit config` prints deprecation message — verified by `cli.test.ts`
- [x] `tracerkit migrate-storage` prints deprecation message — verified by `cli.test.ts`
- [x] `tracerkit init /tmp/test-dir && tracerkit update /tmp/test-dir` succeeds — verified by `init.test.ts` and `update.test.ts`
- [x] All tests pass — `npm test`

---

## Phase 3 — Docs reflect new reality

**User stories**: all

### What to build

Update README to lead with marketplace install (CLI collapsed). Remove all GitHub Issues references from docs. Update agent setup docs. Add migration guide. Review all prose with `/revise`.

### Done when

- [x] README: marketplace install is primary (not inside `<details>`), CLI install is inside collapsed `<details>`
- [x] README: no mention of `tracerkit config`, `migrate-storage`, or GitHub Issues storage
- [x] `docs/cli-reference.md` updated — only `init`, `update`, `uninstall` commands
- [x] `docs/configuration.md` removed or replaced with migration note
- [x] `docs/metadata-lifecycle.md` has no GitHub Issues references
- [x] `docs/examples.md` has no GitHub Issues examples
- [x] `docs/comparison.md` updated if it references GitHub backend
- [x] Agent setup docs (`cursor-setup.md`, `copilot-setup.md`, `gemini-cli-setup.md`, `opencode-setup.md`) have no conditional block references
- [x] Migration guide exists for existing GitHub Issues users
- [x] All docs reviewed with `/revise`

---

## Out of Scope

- Removing the CLI entirely (separate decision, may keep for non-AI-tool users)
- Adding new storage backends
- Changing skill file format or frontmatter schema
- Modifying the plugin marketplace distribution mechanism

## Open Questions

None — all resolved during PRD.
