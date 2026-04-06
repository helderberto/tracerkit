# Plan: Phase 1 — Skills

> Source PRD: `prds/phase-1-skills.md`

## Architectural decisions

- **Plugin format**: Claude Code plugin with `name: "tk"` — skills namespaced as `/tk:prd`, `/tk:plan`, etc.
- **Skills format**: `skills/<name>/SKILL.md` with YAML frontmatter and dynamic context injection
- **Artifact layout**: PRDs in `prds/<slug>.md`; plans in `plans/<slug>.md`
- **Slug**: kebab-case from the argument passed to `/tk:prd`
- **Agent tags**: optional `[agent:debugger|test-auditor|code-reviewer]` suffix on each task in the plan
- **No runtime deps**: skills are pure markdown, zero build step, zero install

---

## Phase 1 — Creation loop works end-to-end

**User stories**: 1, 2, 3, 4, 5, 6, 11, 12

### What to build

Write `skills/prd/SKILL.md` and `skills/plan/SKILL.md`.

`skills/prd/SKILL.md` must:

- Accept an idea as argument
- Explore the codebase before interviewing
- Conduct a branch-based interview (scope, data, behavior, display, access, boundaries, integration)
- Design deep modules and confirm with user
- Write `prds/<slug>.md` with full PRD structure

`skills/plan/SKILL.md` must:

- Read the PRD for the given slug
- Explore the codebase for integration points
- Extract durable architectural decisions
- Draft phased vertical slices (tracer bullets)
- Quiz the user on the breakdown
- Write `plans/<slug>.md` with phased checklist and agent tags

### Done when

`/tk:prd add-user-auth` creates `prds/add-user-auth.md` with full PRD structure;
`/tk:plan add-user-auth` creates `plans/add-user-auth.md` with phased checkboxes
and at least one `[agent:*]` tag.

---

## Phase 2 — Closing loop works end-to-end

**User stories**: 7, 8, 9, 10

### What to build

Write `skills/verify/SKILL.md` and `skills/archive/SKILL.md`.

`skills/verify/SKILL.md` must:

- Launch a read-only subagent (no writes)
- Compare implementation files against the plan
- Output BLOCKERS and SUGGESTIONS as separate sections
- Stamp the plan with a verdict

`skills/archive/SKILL.md` must:

- Read the verdict from the plan
- Block with an error message if verdict is not PASS
- Archive the completed PRD + plan with a closing timestamp

### Done when

`/tk:verify` emits a structured verdict and stamps the plan; `/tk:archive` blocks
on NEEDS WORK and completes the archive on PASS.

---

## Phase 3 — Edge cases and polish

**User stories**: 11, plus error cases (duplicate name, missing name, archive without PASS)

### What to build

Harden all skills:

- `/tk:prd` with no argument: prompt for a name or exit with a clear message
- `/tk:prd` with a duplicate slug: warn and ask to overwrite or pick a new name
- `/tk:plan` with no PRD found: list available PRDs and ask
- `/tk:archive` without a prior `/tk:verify`: exit with actionable message
- Verify each skill is fully self-contained so per-project customization does not break others

### Done when

Each error case produces a clear, actionable message; all skills pass manual acceptance
tests in a scratch project with no side-effects on the tracerkit repo itself.

---

## Out of Scope

- CLI distribution (`tracerkit init`) — Phase 2
- Agents implementation (debugger, test-auditor, code-reviewer) — Phase 3
- Stack detection or profile selection
- Spec-to-test generation
- Multi-agent parallelism via worktrees
- Git linkage (recording closing commit hash in archive)
- `.tracerkit/` directory structure — deferred to Phase 2

## Open Questions

- None — PRD is complete and unambiguous for this scope.

## Archived

Archived on 2026-04-06.
