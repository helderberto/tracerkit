# Simplify Metadata & Status Management

## Problem

TracerKit manages explicit status fields (`created`, `in_progress`, `done`) in YAML frontmatter across PRDs and plans. Every skill reads and writes these fields, creating dual-state sync risk, wasted tokens, and fragile transitions. External spec-driven workflows (Addy Osmani's agent-skills, Matt Pocock's skills) are fully stateless — they derive state from artifacts, not metadata.

## Decision

Eliminate all frontmatter and status management. State is derived from markdown checkboxes and file existence. Phases (vertical slices) become the unit of work. The `@` file reference is the primary interface.

## Principles

1. **State = checkboxes.** No frontmatter, no status fields, no managed timestamps.
2. **Convention = link.** PRD and plan share the same filename: `prds/X.md` <> `plans/X.md`.
3. **Phase = unit of work.** Each phase is a complete vertical slice. The agent works on the phase, not isolated checkboxes.
4. **First incomplete = cursor.** First phase with `[ ]` top-down = where to continue.
5. **Check validates and corrects.** `/tk:check` can unmark `[x]` -> `[ ]` if verification fails.
6. **Flexible input.** Skills accept `@` references, direct paths, or slugs. Without arguments, guide user to `/tk:brief`.

## File Format

### PRD (`.tracerkit/prds/<slug>.md`)

Pure markdown. No frontmatter.

```markdown
# Auth Flow

## Problem

Users can't log in...

## Requirements

- Email/password auth
- OAuth support
```

### Plan (`.tracerkit/plans/<slug>.md`)

Pure markdown. Phases as headings, checkboxes as progress.

```markdown
# Auth Flow

## Phase 1: Basic auth (tracer)

- [ ] users table migration
- [ ] POST /auth/login endpoint
- [ ] Login form component
- [ ] Happy path e2e test

## Phase 2: OAuth

- [ ] Google provider config
- [ ] OAuth callback endpoint
- [ ] "Login with Google" button
- [ ] E2e test OAuth flow
```

## Skill Behavior

### `/tk:prd <idea>`

- Generates `.tracerkit/prds/<slug>.md` via interview + codebase scan
- Pure markdown, no frontmatter
- Suggests: `Run /tk:plan @.tracerkit/prds/<slug>.md next?`

### `/tk:plan`

- Receives PRD (via `@`, path, or slug)
- Generates `.tracerkit/plans/<same-name>.md`
- Pure markdown with phased vertical slices
- Suggests: `Run /tk:build @.tracerkit/plans/<slug>.md when ready`

### `/tk:build`

- Receives plan (via `@`, path, or slug)
- Finds first phase with `[ ]` checkboxes
- Implements the entire vertical slice for that phase
- Marks `[x]` as it implements
- Without argument: guides to `/tk:brief`

### `/tk:check`

- Receives plan (via `@`, path, or slug)
- Verifies each `[x]` against the codebase (code exists? tests pass?)
- Unmarks `[x]` -> `[ ]` if verification fails
- No verdict blocks, no frontmatter changes
- Without argument: guides to `/tk:brief`

### `/tk:brief`

- No arguments
- Globs `.tracerkit/plans/*.md`
- Counts checkboxes per phase, finds first incomplete phase
- Output example:

```
Plans:
  .tracerkit/plans/auth-flow.md
    Phase 1: Basic auth       4/4 done
  > Phase 2: OAuth            1/3    -> next: OAuth callback endpoint
    Phase 3: RBAC             0/5

  .tracerkit/plans/billing.md
  > Phase 1: Stripe setup     0/4    -> next: Stripe config

Use: /tk:build @.tracerkit/plans/auth-flow.md
```

- Plans with all `[x]`: hidden
- No active plans: "No active plans. Run /tk:prd to start."

### What skills NO LONGER do

- No skill reads or writes frontmatter
- No skill performs status transitions
- `/tk:check` does not append verdict blocks

## Documentation Changes

### Delete

- `docs/metadata-lifecycle.md`

### Update

- **`README.md`**: workflow example, skills table, brief example, docs table (remove metadata lifecycle link). Run `/revise` after changes.
- **`docs/examples.md`**: update walkthroughs. Run `/revise` after changes.
- **All skill files** (`skills/*/SKILL.md`): rewrite to remove status transition logic.
- **Brief template** (`templates/.claude/skills/tk:brief/SKILL.md`): rewrite with new behavior.

## Migration

- **Existing PRDs**: remove all `---` frontmatter blocks. Result: pure markdown.
- **Existing plans**: remove all `---` frontmatter blocks. Remove verdict blocks appended by `/tk:check`. Result: pure markdown with checkboxes.
- **Tests**: remove tests that validate frontmatter/status behavior.
- **No breaking change for external users**: skills simply ignore existing frontmatter (YAML doesn't interfere with markdown parsing). New artifacts are generated without it.

## Risks

1. **False "done"** — User marks all `[x]` without running `/tk:check`. Brief hides the plan. Mitigation: user responsibility. `/tk:check` exists for validation.
2. **Plans without phase structure** — Plans without `## Phase` headings can't group by phase in brief. Mitigation: `/tk:plan` generates with this structure.
3. **Multiple plans for same PRD** — Convention assumes 1:1. Extra plans still work in brief/build, just lose the implicit PRD link.

## Research

Compared against two external spec-driven workflows:

- **[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)**: 20 skills, fully stateless. "Verification-as-state" — observable outputs replace internal tracking. Sessions are independent.
- **[mattpocock/skills](https://github.com/mattpocock/skills)**: 19 skills, no persistence. "Output-as-state" — GitHub issues and files are external state. Session isolation by design.

Both validate the approach: derive state from artifacts, don't manage it.
