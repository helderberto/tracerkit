---
description: Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices. Use after /tk:prd.
argument-hint: '[slug]'
---

**Config**: read `.tracerkit/config.json` (default: `local`). Follow matching `<!-- if:local/github -->` blocks.

# PRD to Plan

Break a PRD into phased vertical slices (tracer bullets).

**Interactive prompts**: present options as a numbered list and wait for the user's choice.

<!-- if:local -->

Output: `.tracerkit/plans/<slug>.md`.

<!-- end:local -->
<!-- if:github -->

Output: a GitHub Issue with label `{{github.labels.plan}}`.

<!-- end:github -->

## Pre-loaded context

<!-- if:local -->

- Available PRDs: !`ls .tracerkit/prds/*.md 2>/dev/null || echo "(none)"`
  <!-- end:local -->
  <!-- if:github -->
- Available PRDs: list open GitHub Issues with label `{{github.labels.prd}}`
<!-- end:github -->

## Input

The argument (if provided) is: $ARGUMENTS

Use argument as `<slug>`. If empty, list available PRDs and ask the user to select one.

## Workflow

### 1. Read the PRD

<!-- if:local -->

Read `.tracerkit/prds/<slug>.md`. If missing, list PRDs and ask the user to select one. If `.tracerkit/plans/<slug>.md` exists, ask: "Overwrite existing" / "Pick a new name".

<!-- end:local -->
<!-- if:github -->

Find PRD issue: open issue with label `{{github.labels.prd}}`, title matching `[{{github.labels.prd}}] <slug>:`. If missing, list PRDs and ask the user to select one. If plan issue with label `{{github.labels.plan}}` and matching title exists, ask: "Update existing plan" / "Use a new name".

<!-- end:github -->

### 1b. Update PRD status

<!-- if:local -->

Set `status: in_progress` in `.tracerkit/prds/<slug>.md` frontmatter. Change only `status`.

<!-- end:local -->
<!-- if:github -->

Update the PRD issue:

- Remove `tk:created` label, add `tk:in-progress` label
- Update the `<!-- tk:metadata -->` comment in the issue body to `status: in_progress`
<!-- end:github -->

### 2. Explore the codebase

Map architecture, patterns, integration points. Skip if codebase context exists from prior step.

**Research protocol**: codebase first, then docs. Unverifiable claims → flag as uncertain, never fabricate.

### 3. Identify durable architectural decisions

Before slicing, extract decisions that hold across all phases:

- Route structures / URL patterns
- Database schema shape
- Key data models and definitions
- Auth/authorization approach
- Third-party service boundaries

### 4. Draft vertical slices

Each phase: thin vertical slice through all layers (schema → service → API → UI → tests). Demoable alone.

**Deriving tasks from the PRD:**

| PRD Section       | Becomes                                          |
| ----------------- | ------------------------------------------------ |
| New Modules       | Implement module with interface                  |
| Schema Changes    | Migration + validation                           |
| API Contracts     | Route returning shape                            |
| Navigation        | Wire component to route                          |
| User Stories      | Verify coverage; add task if missing             |
| Testing Decisions | Tests land in the phase where their module lands |
| Out of Scope      | Never create tasks for these                     |

**Within each slice, order by dependency:** schema → service → API → UI → tests. Happy paths before edge cases.

**Phase naming:** use a goal phrase answering "what can we demo when this is done?" (e.g., "Phase 1 — Revenue visible end-to-end"), not a layer name.

**Done when:** checkbox list of atomic, verifiable conditions. Each must name a test file/name, a shell command, or a file+content to verify. No prose-only conditions. Test: "Can an agent verify by reading files, running a command, or checking a test?"

**Layer-by-layer exception:** if complex schema changes underpin all modules and no story stands alone, build data foundation first, then slice vertically.

**Phase count thresholds:**

- 1 module touched → 2–3 phases max
- 2–3 modules touched → 3–5 phases max
- 4+ modules or 6+ phases → stop and ask: "PRD touches 4+ modules. Split before planning?" with options: "Split the PRD" (Recommended) / "Continue anyway".

Count "modules touched" by scanning the PRD's New Modules and Schema Changes sections.

Assign an agent tag to tasks where appropriate:

- `[agent:debugger]` — tracing a bug or unexpected runtime behavior
- `[agent:test-auditor]` — writing or reviewing tests
- `[agent:code-reviewer]` — reviewing API surfaces, interfaces, or public contracts

### 5. Quiz the user

Present breakdown (title, user stories covered, done-when per phase). Ask: "How's the granularity?" with options: "Looks good, proceed" (Recommended) / "Merge some phases" / "Split a phase". Iterate until approved.

### 6. Save plan

<!-- if:local -->

Save to `.tracerkit/plans/<slug>.md` (create dir if missing).

```markdown
---
source_prd: .tracerkit/prds/<slug>.md
slug: <slug>
status: in_progress
---

# Plan: <Feature Name>

> Source PRD: `.tracerkit/prds/<slug>.md`
```

Then update PRD frontmatter: add `plan: .tracerkit/plans/<slug>.md` field.

<!-- end:local -->
<!-- if:github -->

Ensure labels exist: `gh label create {{github.labels.plan}} --force`, `gh label create tk:in-progress --force`.

Create GitHub Issue — title: `[{{github.labels.plan}}] <slug>: Plan: <Feature Title>`, labels: `{{github.labels.plan}}`, `tk:in-progress`.

```markdown
<!-- tk:metadata
source_prd: #<PRD issue number>
slug: <slug>
status: in_progress
-->

# Plan: <Feature Name>

> Source PRD: #<PRD issue number>
```

<!-- end:github -->

### 6b. Backlink PRD

<!-- if:local -->

Already linked via PRD frontmatter `plan:` field (set in step 6).

<!-- end:local -->
<!-- if:github -->

Add comment on PRD issue: "Plan: #<plan-issue-number>" (creates cross-reference).

<!-- end:github -->

Use this structure for the plan body:

```markdown
## Architectural Decisions

Durable decisions that apply across all phases:

- **Key decision**: ...

---

## Phase 1 — <Goal>

**User stories**: <list from PRD>

### What to build

Concise description of this vertical slice — end-to-end behavior, not layer-by-layer.

### Done when

- [ ] Atomic, testable condition
- [ ] Another testable condition

---

<!-- Repeat for each phase -->

## Out of Scope

Carried forward from PRD verbatim.

## Open Questions

Gaps found in the PRD needing resolution. Blank if none.
```

Print one line per phase: `Phase N — <title> (<condition summary>)`. Then ask: "What's next?" with options: "Start implementing" (Recommended) / "Run `/tk:check <slug>`" / "Done for now".

## Execution guidance

When implementing this plan, **always offer to create a feature branch** before writing any code. Ask: "Create branch `feat/<slug>`?" with options: "Yes, create branch" (Recommended) / "No, stay on current branch". If accepted, create the branch from the default branch.

### During implementation

Mark each "Done when" checkbox `[x]` **immediately after verifying** the condition.

Always update the local plan file (`.tracerkit/plans/<slug>.md`): change `- [ ]` → `- [x]`. This file is the working copy for both local and GitHub modes.

<!-- if:github -->

**Sync to GitHub at phase boundaries**: after completing all items in a phase, update the plan issue body with `gh issue edit` to reflect the local state. This avoids per-item API calls.

After all phases, open a PR with body containing `Closes #<prd-issue>, Closes #<plan-issue>`.

<!-- end:github -->

## Rules

- Phases derive from PRD user stories — never invented
- Each phase must be demoable end-to-end on its own
- "Done when" must be a checkbox list of testable conditions, not prose
- **Safety valve**: if a phase has >5 "Done when" items, stop and split it into smaller phases before continuing
<!-- if:local -->
- Never modify the source PRD content — only update frontmatter status fields
  <!-- end:local -->
  <!-- if:github -->
- Never modify the source PRD content — only update metadata and labels
<!-- end:github -->
- Carry PRD's Out of Scope forward verbatim
