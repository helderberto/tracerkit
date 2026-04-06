# Plan: Publish as Claude Code Plugin

> Source PRD: `.tracerkit/prds/publish-plugin.md`

## Architectural Decisions

- **Plugin name**: `tk` — matches existing CLI prefix, avoids breaking change for standalone users
- **Single source of truth**: `skills/` at repo root serves both plugin (direct load) and CLI (copy with prefix)
- **Literal default paths**: skills use `.tracerkit/prds/`, `.tracerkit/plans/`, `.tracerkit/archives/` instead of `{{paths.*}}` placeholders. CLI replaces defaults with custom values when config differs.
- **Skill directory naming**: `skills/brief/`, not `skills/tk:brief/` — plugin namespace adds `tk:` automatically
- **Version sync**: `plugin.json` version tracks `package.json` via semantic-release
- **Dual distribution**: npm for CLI (universal), marketplace for Claude Code (native). Both coexist indefinitely.

---

## Phase 1 — Plugin loads end-to-end via `--plugin-dir`

**User stories**: 1, 4

### Done when

- [x] `.claude-plugin/plugin.json` exists with `name: "tk"`, `description`, `version`, `author`, `repository`, `license`, `keywords`
- [x] `skills/{brief,prd,plan,check}/SKILL.md` exist at repo root with literal default paths
- [x] Zero `{{paths.*}}` placeholders remain in any `skills/**` file
- [x] `claude --plugin-dir .` surfaces `/tk:brief`, `/tk:prd`, `/tk:plan`, `/tk:check`

---

## Phase 2 — CLI reads from new `skills/` source

**User stories**: 3, 5

### Done when

- [x] `templates/.claude/skills/` directory deleted
- [x] `src/templates.ts` reads from `skills/` and copies to `.claude/skills/tk:X/` with `tk:` prefix
- [x] `renderTemplate()` replaces default paths with custom config values when config differs
- [x] `npm run test:run` passes — all existing tests updated for new structure
- [x] `npm run typecheck` passes
- [x] `package.json` `files` field includes `skills/` instead of `templates/`

---

## Phase 3 — Docs + submission package

**User stories**: 6, 7, 8

### Done when

- [ ] README "Get Started" section shows plugin install first: `claude plugin install tk`
- [ ] README keeps npm CLI as alternative under a collapsible "Other tools / manual install" section
- [x] `npm run lint` passes
- [x] Submission values ready

---

## Out of Scope

1. Hooks, agents, MCP servers, LSP servers — skills only
2. `settings.json` in plugin (no default agent)
3. `bin/` directory in plugin
4. Cursor/other-tool specific adapters
5. Automatic migration from standalone → plugin
6. Custom path support in plugin mode (CLI-only feature)
7. Plugin homepage (empty for now)
8. `commands/` directory (legacy, not needed)

## Open Questions

None — all resolved during PRD interview.

---

## Verdict

- **Date**: 2026-04-06
- **Checks**: 12/14
- **BLOCKERS**: 1
- **SUGGESTIONS**: 2

## Archived

Archived on 2026-04-06. Route changed — README reorder pending, but project direction shifted.
