# Plan: Phase 1 — Skills

> Source PRD: `prds/phase-1-skills.md`

## Architectural decisions

- **Skills format**: plain `.md` files, no frontmatter — Claude Code loads any `.md` in `.claude/commands/` as a slash command
- **Artifact layout**: `.tracerkit/changes/<kebab-slug>/proposal.md + spec.md + tasks.md`; archive mirrors same structure under `.tracerkit/archive/`
- **Change name**: kebab-case slug from the argument passed to `/tk:propose`
- **Verdict**: written as `<!-- verify: PASS | YYYY-MM-DD -->` at top of `spec.md`; read by `/tk:archive` to gate archiving
- **Agent tags**: optional `[agent:debugger|test-auditor|code-reviewer]` suffix on each task in `tasks.md`
- **No runtime deps**: skills are pure markdown, zero build step, zero install

---

## Phase 1 — Creation loop works end-to-end

**User stories**: 1, 2, 3, 4, 10, 11, 12

### What to build

Write `skills/tk-propose.md` and `skills/tk-plan.md`.

`tk-propose.md` must:

- Accept an idea slug as argument
- Check if a planning doc or existing spec is present; if so, skip the interview
- Otherwise conduct a focused interview (problem, expected behaviors, acceptance criteria)
- Write `.tracerkit/changes/<slug>/proposal.md`, `spec.md`, and `tasks.md` stubs

`tk-plan.md` must:

- Read `spec.md` for the active change
- Rewrite `tasks.md` as a tracer-bullet checkbox list
- Tag each task with `[agent:*]` where appropriate

### Done when

`/tk:propose add-user-auth` creates `.tracerkit/changes/add-user-auth/` with all three files
populated; `/tk:plan` rewrites `tasks.md` with checkboxes and at least one `[agent:*]` tag.

---

## Phase 2 — Closing loop works end-to-end

**User stories**: 5, 6, 7, 8

### What to build

Write `skills/tk-verify.md` and `skills/tk-archive.md`.

`tk-verify.md` must:

- Launch a read-only subagent (no writes)
- Compare implementation files against `spec.md`
- Output BLOCKERS and SUGGESTIONS as separate sections
- Write `<!-- verify: PASS | date -->` or `<!-- verify: NEEDS WORK | date -->` at top of `spec.md`

`tk-archive.md` must:

- Read the verify comment from `spec.md`
- Block with an error message if verdict is not PASS
- Move `.tracerkit/changes/<slug>/` to `.tracerkit/archive/<slug>/` with a closing timestamp

### Done when

`/tk:verify` emits a structured verdict and stamps `spec.md`; `/tk:archive` blocks on NEEDS WORK
and completes the move on PASS, leaving a timestamp in the archived directory.

---

## Phase 3 — Edge cases and polish

**User stories**: 9, plus testing decisions (duplicate name, missing name, archive without PASS)

### What to build

Harden all four skills:

- `/tk:propose` with no argument: prompt for a name or exit with a clear message
- `/tk:propose` with a duplicate slug: warn and ask to overwrite or pick a new name
- `/tk:archive` without a prior `/tk:verify`: exit with actionable message
- Verify each skill is fully self-contained so per-project customization does not break others

### Done when

Each error case produces a clear, actionable message; all four skills pass manual acceptance
tests in a scratch project with no side-effects on the tracerkit repo itself.

---

## Out of Scope

- CLI distribution (`tracerkit init`) — Phase 2
- Agents implementation (debugger, test-auditor, code-reviewer) — Phase 3
- Stack detection or profile selection
- Spec-to-test generation (auto-generate failing tests from spec.md)
- Multi-agent parallelism via worktrees
- Git linkage (recording closing commit hash in archive)

## Open Questions

- None — PRD is complete and unambiguous for this scope.
