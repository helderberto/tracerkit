# Phase 1 — Skills

## Problem Statement

AI coding assistants lack a structured, repeatable workflow for proposing, planning,
implementing, and archiving changes. Developers using Claude Code end up reinventing
this loop per project, with no shared conventions or artifact trail.

## Solution

A set of Claude Code slash commands (skills) that enforce the tracerkit workflow loop
inside any project. Once installed, the developer runs `/tk:propose`, `/tk:plan`,
`/tk:verify`, and `/tk:archive` in sequence. Each command produces or consumes
structured markdown artifacts in `.tracerkit/changes/`.

The skills are plain markdown files — no build step, no runtime dependency. They work
immediately after being copied into `.claude/commands/`.

## User Stories

1. As a developer, I want to run `/tk:propose <idea>` so that a structured change
   directory is created with proposal, spec, and tasks stubs.
2. As a developer, I want `/tk:propose` to ask me focused questions about the problem
   and expected behaviors so that spec.md reflects real acceptance criteria.
3. As a developer, I want to run `/tk:plan` so that the agent reads spec.md and produces
   a tracer-bullet task list in tasks.md with vertical slices.
4. As a developer, I want `/tk:plan` to assign an agent type per task (debugger,
   test-auditor, code-reviewer) so that the right specialist handles each slice.
5. As a developer, I want to run `/tk:verify` so that a subagent compares the current
   implementation against spec.md and produces a PASS / NEEDS WORK verdict.
6. As a developer, I want `/tk:verify` to list BLOCKERS and SUGGESTIONS separately so
   that I know what must be fixed before shipping.
7. As a developer, I want to run `/tk:archive` so that the completed change is moved
   from `.tracerkit/changes/` to `.tracerkit/archive/` with a closing timestamp.
8. As a developer, I want `/tk:archive` to require a PASS verdict from `/tk:verify`
   before archiving so that incomplete changes are never silently closed.
9. As a developer, I want each skill to be a standalone markdown file so that I can
   customize it per project without affecting other projects.
10. As a developer, I want `.tracerkit/changes/<name>/` to always contain the same three
    files (proposal.md, spec.md, tasks.md) so that tooling and humans have a predictable
    structure.
11. As a developer, I want `/tk:propose` to skip the proposal interview if a planning
    document already exists so that mature ideas go straight to spec.
12. As a developer, I want tasks.md to use a checkbox format so that progress is visible
    in any markdown viewer.

## Implementation Decisions

### Skills (Claude Code slash commands)

Four markdown files placed in `.claude/commands/` of the target project:

- `tk-propose.md` — interviews the developer, writes proposal.md + spec.md + tasks.md
- `tk-plan.md` — reads spec.md, rewrites tasks.md as tracer-bullet checklist
- `tk-verify.md` — launches read-only subagent, compares impl vs spec, emits verdict
- `tk-archive.md` — checks for PASS verdict, moves change dir to archive with timestamp

### Artifact Structure

```
.tracerkit/
  changes/
    <name>/
      proposal.md   — problem, context, why (optional if idea is mature)
      spec.md       — expected behaviors, acceptance criteria
      tasks.md      — tracer-bullet checklist with agent assignments
  archive/
    <name>/         — same structure, immutable after archiving
```

### Skill Format

Each skill is a markdown file with a `# Instructions` section and optional
`## Steps` sub-sections. No frontmatter required — Claude Code loads any `.md`
file from `.claude/commands/` as a slash command.

### Change Name Convention

Kebab-case slug derived from the idea passed to `/tk:propose`. Example:
`/tk:propose add user auth` → `.tracerkit/changes/add-user-auth/`.

### Proposal Step

Optional. `/tk:propose` checks if a planning document or existing spec exists.
If the idea is already well-defined, it skips the interview and writes stubs
directly from the provided context.

### Verify Verdict

`/tk:verify` writes its verdict as a comment block at the top of spec.md:

```
<!-- verify: PASS | 2026-03-31 -->
```

`/tk:archive` reads this comment to gate archiving.

### Agent Assignments in tasks.md

Each task in tasks.md carries an optional agent tag:

```
- [ ] Implement token refresh logic [agent:debugger]
- [ ] Add unit tests for edge cases [agent:test-auditor]
- [ ] Review public API surface [agent:code-reviewer]
```

## Testing Decisions

- Skills are markdown — unit tests are not applicable
- Acceptance test: run each skill in a scratch project and verify the expected
  artifacts are created with correct structure
- Key cases: missing change name, duplicate change name, archiving without PASS verdict
- `/tk:verify` subagent must operate read-only — verify it makes no writes

## Out of Scope

- CLI distribution (`tracerkit init`) — Phase 2
- Agents implementation (debugger, test-auditor, code-reviewer) — Phase 3
- Stack detection or profile selection
- Spec-to-test generation (auto-generate failing tests from spec.md)
- Multi-agent parallelism via worktrees
- Git linkage (recording closing commit hash in archive)
