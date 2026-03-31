---
description: Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices, saved to plans/. Use after /tk:prd.
argument-hint: '[slug]'
---

# PRD to Plan

Break a PRD into phased vertical slices (tracer bullets). Output: `plans/<slug>.md`.

## Pre-loaded context

- Available PRDs: !`ls prds/ 2>/dev/null || echo "no prds/ directory found"`

## Input

The argument (if provided) is: $ARGUMENTS

Use the argument as `<slug>` if given. If no argument is provided, list available PRDs and ask which one to plan.

## Workflow

### 1. Read the PRD

Read `prds/<slug>.md`. If it does not exist, list available PRDs and ask.

If `plans/<slug>.md` already exists, tell the user and ask whether to overwrite or pick a new name.

### 1b. Update PRD status

Update the YAML frontmatter in `prds/<slug>.md` to `status: in_progress`. Change only the `status` field — do not touch any other frontmatter fields or the markdown content below the closing `---`.

If the PRD has no frontmatter, skip this step silently.

### 2. Explore the codebase

Understand current architecture, existing patterns, and integration points.

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

**When to use layer-by-layer instead:** If the PRD has complex schema changes that all modules depend on and no single user story can stand alone without the full schema, build the data foundation first, then slice the rest vertically.

**Phase count:** 2–3 for single-module, 3–5 for multi-module, 5+ means consider splitting the PRD.

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

Save to `plans/<slug>.md` (create `plans/` if missing).

```markdown
# Plan: <Feature Name>

> Source PRD: `prds/<slug>.md`

## Architectural Decisions

Durable decisions that apply across all phases:

- **Key decision**: ...

---

## Phase 1 — <Goal>

**User stories**: <list from PRD>

### What to build

Concise description of this vertical slice — end-to-end behavior, not layer-by-layer.

### Done when

<Specific, testable condition>

---

<!-- Repeat for each phase -->

## Out of Scope

Carried forward from PRD verbatim.

## Open Questions

Gaps found in the PRD needing resolution. Blank if none.
```

Print saved path and one line per phase: `Phase N — <title> (<condition summary>)`.

## Rules

- Phases derive from PRD user stories — never invented
- Each phase must be demoable end-to-end on its own
- "Done when" must be testable, not vague
- Never modify the source PRD
- Carry PRD's Out of Scope forward verbatim

## Error Handling

- PRD not found — list available PRDs and ask
- PRD missing sections — note gaps inline and continue
- `plans/` missing — create it
