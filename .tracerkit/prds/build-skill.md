---
created: 2026-04-10T17:15:00Z
status: done
completed: 2026-04-10T17:30:00Z
plan: .tracerkit/plans/build-skill.md
---

# /tk:build Skill

## Problem Statement

After `/tk:plan` produces phased vertical slices, there is no structured way to guide the agent through implementation phase by phase. Agents tend to read the entire plan and implement everything at once, skipping tests and ignoring phase boundaries. The gap between PLAN and VERIFY needs a disciplined executor.

## Current State

- `/tk:prd` defines what to build
- `/tk:plan` breaks it into phased vertical slices with done-when checkboxes
- `/tk:check` verifies implementation against the plan
- No skill exists to drive the BUILD phase — the agent is left unguided between plan and check

## Solution

`/tk:build` is a phase-by-phase implementation driver. It reads the plan, identifies the next incomplete phase, and guides the agent through that single phase. It does NOT impose coding rules — it respects the user's own conventions (CLAUDE.md, linter, test setup, coding style). It only enforces the discipline of following the plan one slice at a time.

**Core principle: HITL (Human-in-the-Loop).** The agent implements, but the human stays in control — approving commits, resolving blockers, deciding when to advance.

**Context window recommendation:** Start with a clean context (`/clear`) before running `/tk:build` to maximize token budget for actual implementation.

### User Experience

```
You: /clear
You: /tk:build dark-mode-support

AI:  Phase 2 — User can toggle and persist preference (3 remaining)
     - [ ] Toggle component renders in header
     - [ ] Preference saved to localStorage
     - [ ] Page loads with saved preference

     Implementing...

     [implements phase, runs feedback loops]

     All checks pass. Commit changes?
     1. Yes, commit
     2. No, I'll review first

You: 1

AI:  Committed. Phase 2 complete (2/3 checked).
     Run `/tk:build dark-mode-support` for Phase 3, or `/tk:check` to verify.
```

Accepts slug or `@file` reference:

```
/tk:build dark-mode-support
/tk:build @.tracerkit/plans/dark-mode-support.md
```

## User Stories

1. Dev runs `/tk:build <slug>` after planning — agent identifies Phase 1 as the next incomplete phase and implements only that slice
2. Dev runs `/tk:build <slug>` mid-feature — agent skips completed phases and picks up at the first phase with unchecked items
3. Feedback loops detect a test failure — agent fixes the issue and re-runs checks before proceeding
4. A phase requires an API key the agent can't provide — agent pauses, describes the blocker, and waits for the dev to resolve it (HITL)
5. All checks pass — agent asks whether to commit, respecting dev's review preference
6. Dev runs `/tk:build` on a fully completed plan — agent reports all phases done and suggests `/tk:check`

## Implementation Decisions

### New Modules

- `skills/build/SKILL.md` — the skill itself. Pure Markdown, no runtime code. Single entry point: `/tk:build <slug>` or `/tk:build @file`.

### Architectural Decisions

- **Tool-agnostic prompts**: no direct reference to `AskUserQuestion` or any Claude Code-specific tool. Use natural language ("ask the user", "present options") that triggers interactive menus in Claude Code and works as numbered lists elsewhere.
- **Respects user conventions**: the skill never imposes coding rules, linter config, test frameworks, or commit message formats. It reads what exists in the project and follows it.
- **Feedback loops from project scripts**: detect available scripts in `package.json` (typecheck, test, lint) and run the ones that exist. No assumptions about what the project uses.
- **Sequential phases only**: never skip a phase, never implement multiple phases in one call.
- **HITL at every decision point**: commit, blocker resolution, advancing to next phase.
- **Checkbox ownership**: after feedback loops pass, the skill marks `- [x]` on completed items in the plan file. The plan remains the source of truth.

### Boundaries

- **Never**: create or modify PRD or plan content (domain of `/tk:prd` and `/tk:plan`)
- **Never**: impose coding rules, style, or conventions beyond what the user has configured
- **Never**: push to remote (only commit locally, if the dev approves)
- **Never**: skip a phase or implement out of order
- **Never**: auto-advance to the next phase — one phase per invocation

## Testing Decisions

- Skill registration: verify `tk:build` appears in `SKILL_NAMES` constant
- Template install: verify `tracerkit init` copies `skills/build/SKILL.md` to `.claude/skills/tk:build/SKILL.md`
- Template update: verify `tracerkit update` handles the new skill
- Uninstall: verify `tracerkit uninstall` removes `tk:build` directory

## Out of Scope

- Code generation rules or coding style enforcement
- Auto-advance through multiple phases in one invocation
- Push to remote or PR creation
- Modifying PRD content
- Running in CI/CD (this is an interactive dev workflow)
