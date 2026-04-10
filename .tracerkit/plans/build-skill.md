---
source_prd: .tracerkit/prds/build-skill.md
slug: build-skill
status: done
completed: 2026-04-10T17:30:00Z
---

# Plan: /tk:build Skill

> Source PRD: `.tracerkit/prds/build-skill.md`

## Architectural Decisions

- **Tool-agnostic prompts**: no reference to `AskUserQuestion` or Claude Code-specific tools. Use natural language ("ask the user", "present options") that works across all agents.
- **HITL (Human-in-the-Loop)**: agent implements, human approves commits and resolves blockers.
- **One phase per invocation**: never auto-advance. Dev calls `/tk:build` again for the next phase.
- **Feedback loops from project scripts**: detect `package.json` scripts (typecheck, test, lint) and run what exists. No assumptions.
- **Respects user conventions**: no coding rules imposed. Follows CLAUDE.md, linter, test setup already configured.
- **Context window recommendation**: suggest `/clear` before `/tk:build` for maximum token budget.

---

## Phase 1 — `/tk:build` skill installs and runs

**User stories**: 1, 2, 3, 4, 5, 6

### What to build

Create `skills/build/SKILL.md` with the full workflow: read plan, find next incomplete phase, implement it, run feedback loops, mark checkboxes, offer commit. Register `tk:build` in `SKILL_NAMES` so the CLI installs it.

### Done when

- [x] `skills/build/SKILL.md` exists with YAML frontmatter (`description`, `argument-hint`)
- [x] Skill contains config preamble, conditional `<!-- if:local/github -->` blocks
- [x] Skill workflow: load plan → find next phase → implement → feedback loops → mark checkboxes → offer commit
- [x] Skill contains HITL pause points (blockers, commit approval)
- [x] Skill recommends `/clear` before starting
- [x] `src/constants.ts` includes `tk:build` in `SKILL_NAMES`
- [x] `tracerkit init` in a temp dir produces `.claude/skills/tk:build/SKILL.md`
- [x] All existing tests pass (`npx vitest run`)

---

## Phase 2 — Tests cover the new skill

**User stories**: PRD Testing Decisions

### What to build

Update test files to account for 5 skills (was 4). Verify `tk:build` appears in copies, diffs, uninstalls.

### Done when

- [x] `templates.test.ts`: `copyTemplates` expects 5 files including `tk:build`
- [x] `templates.test.ts`: `diffTemplates` reports 5 missing on empty target
- [x] `templates.test.ts`: `leaves no unresolved placeholders` loop includes `tk:build`
- [x] `templates.test.ts`: `skills contain storage config preamble` loop includes `tk:build`
- [x] `uninstall.test.ts`: verifies `tk:build` directory is removed
- [x] All tests pass with zero warnings (`npx vitest run`)

---

## Phase 3 — Documentation reflects the new skill

**User stories**: PRD Solution (user experience)

### What to build

Update all user-facing docs: README workflow diagram, skills table, plugin description, setup guides, comparison text.

### Done when

- [x] README.md contains ASCII workflow diagram (DEFINE→PLAN→BUILD→VERIFY with `/tk:prd`, `/tk:plan`, `/tk:build`, `/tk:check`)
- [x] README.md skills table includes `/tk:build` row
- [x] README.md intro text says "four skills" (was "three")
- [x] `.claude-plugin/plugin.json` description includes "build"
- [x] `docs/cursor-setup.md` includes `tk:build` in skill copies
- [x] `docs/gemini-cli-setup.md` includes `tk:build` in skill list
- [x] `docs/copilot-setup.md` includes `tk:build` in skill copies
- [x] `docs/opencode-setup.md` includes `tk:build` in intent mapping table
- [x] `npx prettier --check .` passes
- [x] All tests pass (`npx vitest run`)

---

## Out of Scope

- Code generation rules or coding style enforcement
- Auto-advance through multiple phases in one invocation
- Push to remote or PR creation
- Modifying PRD content
- Running in CI/CD (this is an interactive dev workflow)

## Open Questions

None.

---

## Verdict

- **Date**: 2026-04-10
- **Checks**: 24/24
- **BLOCKERS**: 0
- **SUGGESTIONS**: 0
