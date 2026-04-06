---
status: done
completed: 2026-04-06T00:00:00Z
---

# Phase 1 — Skills

## Problem Statement

AI coding assistants lack a structured, repeatable workflow for planning,
implementing, and archiving changes. Developers using Claude Code end up reinventing
this loop per project, with no shared conventions or artifact trail.

## Solution

A Claude Code plugin (`tk`) that enforces the tracerkit workflow loop inside any
project. The developer runs `/tk:prd`, `/tk:plan`, `/tk:verify`, and `/tk:archive`
in sequence. Each command produces or consumes structured markdown artifacts.

The plugin is distributed as a directory with `.claude-plugin/plugin.json` and
`skills/` — no build step, no runtime dependency.

## User Stories

1. As a developer, I want to run `/tk:prd <idea>` so that a structured PRD is
   created through an interview grounded in my codebase.
2. As a developer, I want `/tk:prd` to explore my codebase before interviewing so
   that implementation decisions reflect real architecture.
3. As a developer, I want `/tk:prd` to design deep modules so that the PRD
   captures clean interfaces, not shallow function lists.
4. As a developer, I want to run `/tk:plan <slug>` so that the PRD is broken into
   phased tracer-bullet vertical slices saved to `plans/`.
5. As a developer, I want `/tk:plan` to assign an agent type per task (debugger,
   test-auditor, code-reviewer) so that the right specialist handles each slice.
6. As a developer, I want `/tk:plan` to quiz me on the breakdown so that I can
   adjust granularity before implementation starts.
7. As a developer, I want to run `/tk:verify` so that a subagent compares the
   current implementation against the plan and produces a PASS / NEEDS WORK verdict.
8. As a developer, I want `/tk:verify` to list BLOCKERS and SUGGESTIONS separately
   so that I know what must be fixed before shipping.
9. As a developer, I want to run `/tk:archive` so that the completed PRD and plan
   are moved to an archive with a closing timestamp.
10. As a developer, I want `/tk:archive` to require a PASS verdict from `/tk:verify`
    before archiving so that incomplete changes are never silently closed.
11. As a developer, I want each skill to be a standalone SKILL.md so that I can
    customize it per project without affecting other projects.
12. As a developer, I want plans to use a checkbox format so that progress is
    visible in any markdown viewer.

## Implementation Decisions

### Plugin Structure

A Claude Code plugin named `tk` with skills in `skills/`:

```
tracerkit/
  .claude-plugin/
    plugin.json         — name: "tk"
  skills/
    prd/SKILL.md        — /tk:prd — interviews developer, writes prds/<slug>.md
    plan/SKILL.md       — /tk:plan — reads PRD, writes plans/<slug>.md
    verify/SKILL.md     — /tk:verify — read-only subagent, compares impl vs plan, emits verdict
    archive/SKILL.md    — /tk:archive — checks PASS verdict, archives PRD + plan
```

### Workflow

```
/tk:prd <idea>     →  prds/<slug>.md
/tk:plan <slug>    →  plans/<slug>.md
  (implement phases)
/tk:verify <slug>  →  stamps plan with verdict
/tk:archive <slug> →  archives completed work
```

### Artifact Structure

```
prds/
  <slug>.md         — PRD from /tk:prd

plans/
  <slug>.md         — phased tracer-bullet plan from /tk:plan
```

### Skill Format

Each skill is a directory with `SKILL.md` using YAML frontmatter (`description`,
`argument-hint`, `disable-model-invocation`). Supports dynamic context injection
via `!` backtick syntax.

### Slug Convention

Kebab-case slug derived from the idea passed to `/tk:prd`. Example:
`/tk:prd add user auth` → `prds/add-user-auth.md`.

### Agent Assignments

Each task in the plan carries an optional agent tag:

```
- [ ] Implement token refresh logic [agent:debugger]
- [ ] Add unit tests for edge cases [agent:test-auditor]
- [ ] Review public API surface [agent:code-reviewer]
```

## Testing Decisions

- Skills are markdown — unit tests are not applicable
- Acceptance test: run each skill in a scratch project and verify the expected
  artifacts are created with correct structure
- Key cases: missing slug, duplicate slug, archiving without PASS verdict
- `/tk:verify` subagent must operate read-only — verify it makes no writes

## Out of Scope

- CLI distribution (`tracerkit init`) — Phase 2
- Agents implementation (debugger, test-auditor, code-reviewer) — Phase 3
- Stack detection or profile selection
- Spec-to-test generation
- Multi-agent parallelism via worktrees
- Git linkage (recording closing commit hash in archive)
- `.tracerkit/` directory structure — deferred to Phase 2 (verify/archive)
