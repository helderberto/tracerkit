---
description: Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices. Use after /tk:prd.
argument-hint: '[slug]'
---

## Storage

Read `.tracerkit/config.json` in the project root. If absent, use `local`.

- **`local`** (default): follow `<!-- if:local -->` blocks, ignore `<!-- if:github -->` blocks
- **`github`**: follow `<!-- if:github -->` blocks, ignore `<!-- if:local -->` blocks. Use `github.repo` from config (or auto-detect from git remote). Labels default to `tk:prd`/`tk:plan` but may be overridden in config.

# PRD to Plan

Break a PRD into phased vertical slices (tracer bullets).

<!-- if:local -->

Output: `.tracerkit/plans/<slug>.md`.

<!-- end:local -->
<!-- if:github -->

Output: a GitHub Issue with label `{{github.labels.plan}}`.

<!-- end:github -->

## Pre-loaded context

<!-- if:local -->

- Available PRDs: !`ls .tracerkit/prds/ 2>&1`
  <!-- end:local -->
  <!-- if:github -->
- Available PRDs: list open GitHub Issues with label `{{github.labels.prd}}`
<!-- end:github -->

## Input

The argument (if provided) is: $ARGUMENTS

Use the argument as `<slug>` if given. If no argument is provided, list available PRDs and ask which one to plan.

## Workflow

### 1. Read the PRD

<!-- if:local -->

Read `.tracerkit/prds/<slug>.md`. If it does not exist, list available PRDs and ask.

If `.tracerkit/plans/<slug>.md` already exists, tell the user and ask whether to overwrite or pick a new name.

<!-- end:local -->
<!-- if:github -->

Find the PRD issue: search for an open GitHub Issue with label `{{github.labels.prd}}` and title matching `[{{github.labels.prd}}] <slug>:`. Read its body. If not found, list available PRD issues and ask.

Search for an existing plan issue with label `{{github.labels.plan}}` and title matching `[{{github.labels.plan}}] <slug>:`. If found, tell the user and ask whether to update it or pick a new name.

<!-- end:github -->

### 1b. Update PRD status

<!-- if:local -->

Update the YAML frontmatter in `.tracerkit/prds/<slug>.md` to `status: in_progress`. Change only the `status` field — do not touch any other frontmatter fields or the markdown content below the closing `---`.

If the PRD has no frontmatter, skip this step silently.

<!-- end:local -->
<!-- if:github -->

Update the PRD issue:

- Remove `tk:created` label, add `tk:in-progress` label
- Update the `<!-- tk:metadata -->` comment in the issue body to `status: in_progress`
<!-- end:github -->

### 2. Explore the codebase

Understand current architecture, existing patterns, and integration points. If you already have codebase context from a prior step in this conversation (e.g., you just ran `/tk:prd`), skip the exploration and note which context you're reusing.

**Research protocol**: codebase first, then project docs. If you cannot verify a technical claim from these sources, flag it as uncertain — never fabricate.

### 3. Identify durable architectural decisions

Before slicing, extract decisions that hold across all phases:

- Route structures / URL patterns
- Database schema shape
- Key data models and definitions
- Auth/authorization approach
- Third-party service boundaries

### 4. Draft vertical slices

Each phase is a thin **tracer bullet** — a narrow but complete path through every integration layer (schema, service, API, UI, tests). A completed phase is demoable on its own.

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

**Done when:** write as a checkbox list of atomic, verifiable conditions — not prose. Each item must pass this test: _"Can an agent verify this by reading files, running a command, or checking a test result — with no subjective judgment?"_ Bad: "API is clean". Good: "`GET /api/revenue` returns `{ total: number }`". The agent marks `[x]` during implementation to track progress.

**When to use layer-by-layer instead:** If the PRD has complex schema changes that all modules depend on and no single user story can stand alone without the full schema, build the data foundation first, then slice the rest vertically.

**Phase count thresholds:**

- 1 module touched → 2–3 phases max
- 2–3 modules touched → 3–5 phases max
- 4+ modules or 6+ phases → stop and ask the user to split the PRD

Count "modules touched" by scanning the PRD's New Modules and Schema Changes sections.

Assign an agent tag to tasks where appropriate:

- `[agent:debugger]` — tracing a bug or unexpected runtime behavior
- `[agent:test-auditor]` — writing or reviewing tests
- `[agent:code-reviewer]` — reviewing API surfaces, interfaces, or public contracts

### 5. Quiz the user

Present the breakdown. For each phase show:

- **Title**: short goal phrase
- **User stories covered**: which PRD stories this addresses
- **Done when**: the testable condition

Ask: Does the granularity feel right? Should any phases merge or split? Iterate until approved.

### 6. Save plan

<!-- if:local -->

Save to `.tracerkit/plans/<slug>.md` (create `.tracerkit/plans/` if missing).

```markdown
# Plan: <Feature Name>

> Source PRD: `.tracerkit/prds/<slug>.md`
```

<!-- end:local -->
<!-- if:github -->

Ensure the following labels exist (create if missing):

- `{{github.labels.plan}}` — TracerKit implementation plan
- `tk:in-progress` — Plan generated, implementation underway

Create a GitHub Issue with:

- **Title**: `[{{github.labels.plan}}] <slug>: Plan: <Feature Title>`
- **Labels**: `{{github.labels.plan}}`, `tk:in-progress`
- **Body**: the plan content below, with a source PRD reference by issue number

```markdown
<!-- tk:metadata
source_prd: #<PRD issue number>
slug: <slug>
-->

# Plan: <Feature Name>

> Source PRD: #<PRD issue number>
```

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

<!-- if:local -->

Print saved path and one line per phase: `Phase N — <title> (<condition summary>)`. Then ask: "Run `/tk:check <slug>` when ready?"

<!-- end:local -->
<!-- if:github -->

Print issue number/URL and one line per phase: `Phase N — <title> (<condition summary>)`. Then ask: "Run `/tk:check <slug>` when ready?"

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

## Error Handling

- PRD not found — list available PRDs and ask
- PRD missing sections — note gaps inline and continue
<!-- if:local -->
- `.tracerkit/plans/` missing — create it
  <!-- end:local -->
  <!-- if:github -->
- Issue creation fails — report the error and suggest checking `gh auth status`
<!-- end:github -->
