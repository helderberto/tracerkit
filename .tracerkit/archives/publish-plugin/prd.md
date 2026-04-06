---
created: 2026-04-06T12:00:00Z
status: done
completed: 2026-04-06T00:00:00Z
---

# Publish as Claude Code Plugin

## Problem Statement

TracerKit distributes skills via an npm CLI that copies template files. Claude Code now has a native plugin system that handles discovery, installation, and updates automatically. Users should be able to install TracerKit directly as a plugin without npm, while the CLI remains available for non-Claude Code tools (Cursor, etc.).

## Current State

- Skills live in `templates/.claude/skills/tk:brief/`, `tk:prd/`, `tk:plan/`, `tk:check/`
- CLI (`src/commands/init.ts`, `update.ts`, `uninstall.ts`) copies templates to target `.claude/skills/`
- `src/templates.ts` renders `{{paths.*}}` placeholders during copy
- Custom path config via `.tracerkit/config.json` (prds, plans, archives paths)
- Published on npm as `tracerkit` v1.10.2
- No `.claude-plugin/plugin.json` exists

## Solution

Add a Claude Code plugin manifest and restructure skills so the repo root IS the plugin directory. The CLI continues working by reading from the same `skills/` source, adding the `tk:` prefix when copying to standalone targets. Users get two installation channels: `claude plugin install` (native) or `npm install -g tracerkit` (universal).

## User Stories

1. As a Claude Code user, I want to install TracerKit via the plugin marketplace so I get `/tk:brief`, `/tk:prd`, `/tk:plan`, `/tk:check` without npm
2. As a Claude Code user, I want plugin updates to arrive automatically when the maintainer publishes a new version
3. As an existing CLI user, I want `tracerkit init` and `tracerkit update` to keep working after the restructure
4. As a developer testing locally, I want to run `claude --plugin-dir .` from the repo root to test the plugin
5. As a Cursor/other-tool user, I want the npm CLI to remain my installation path
6. As a plugin reviewer, I want the submission form fields (name, description, use cases) filled correctly
7. As a new user, I want the README to show both installation methods clearly
8. As an existing user with standalone skills, I want to know the plugin exists so I can migrate

## Implementation Decisions

### New Modules

**Plugin Manifest** (`.claude-plugin/plugin.json`)

- Static JSON file with metadata: `name: "tk"`, version synced from `package.json`, description, author, repository, license, keywords
- No custom component paths needed — skills in default `skills/` location

**Skills Restructure**

- Move `templates/.claude/skills/tk:X/SKILL.md` → `skills/X/SKILL.md`
- Directory names drop `tk:` prefix (plugin namespace adds it automatically)
- Skills used in plugin mode must use literal paths (`.tracerkit/prds/`) instead of `{{paths.*}}` placeholders
- `{{paths.*}}` placeholders remain as comments or secondary references for CLI rendering

**CLI Template Adapter** (`src/templates.ts` changes)

- Read skill source from `skills/` at repo root instead of `templates/.claude/skills/`
- When copying to target, prepend `tk:` to skill directory names
- Continue rendering `{{paths.*}}` placeholders for CLI users with custom config
- Delete `templates/.claude/skills/` after migration
- Update `package.json` `files` field to include `skills/` instead of `templates/`

**Submission Package**

- Plugin name: `tk`
- Link: `https://github.com/helderberto/tracerkit`
- Description: "Spec-driven workflow for AI coding agents: PRD, plan, verify, and archive features using tracer-bullet vertical slices."
- Example use cases:
  1. `/tk:prd auth-redesign` — interview-driven PRD with codebase exploration and deep module design
  2. `/tk:plan auth-redesign` — break PRD into phased tracer-bullet vertical slices with testable checkpoints
  3. `/tk:check auth-redesign` — verify implementation against plan, auto-archive on pass
  4. `/tk:brief` — session dashboard showing active features, progress, and suggested focus

**README Update**

- Add a "Claude Code Plugin" install section before the existing npm CLI section
- Show `claude plugin install tk` as the primary install method
- Keep npm CLI as alternative under "Other tools / manual install"
- Reorder: plugin install first (native), npm second (universal)

### Architectural Decisions

- **Single source of truth**: `skills/` at repo root serves both plugin and CLI
- **Plugin name `tk`**: matches existing CLI prefix, avoids breaking change for standalone users
- **No `{{paths.*}}` in plugin mode**: plugin skills use default paths (`.tracerkit/prds/`, `.tracerkit/plans/`, `.tracerkit/archives/`). Custom paths are CLI-only.
- **Version sync**: `plugin.json` version tracks `package.json` via semantic-release
- **Dual distribution**: npm for CLI (universal), marketplace for Claude Code (native). Both coexist indefinitely.

## Testing Decisions

- Template adapter changes need tests: verify `tk:` prefix added on copy, verify `{{paths.*}}` still rendered for CLI
- Skill restructure: verify skills load correctly via `claude --plugin-dir .`
- Existing CLI tests (`init.test.ts`, `update.test.ts`, `uninstall.test.ts`, `templates.test.ts`) must pass after restructure
- Plugin manifest: validate JSON schema manually or via `claude plugin validate`
- Test patterns: use existing `useTmpDir()` helper, colocated test files

## Out of Scope

1. Hooks, agents, MCP servers, LSP servers — skills only
2. `settings.json` in plugin (no default agent)
3. `bin/` directory in plugin
4. Cursor/other-tool specific adapters
5. Automatic migration from standalone → plugin
6. Custom path support in plugin mode (CLI-only feature)
7. Plugin homepage (empty for now)
8. `commands/` directory (legacy, not needed)
