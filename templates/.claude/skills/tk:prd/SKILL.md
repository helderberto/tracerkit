---
description: Create a PRD through user interview, codebase exploration, and module design, saved to {{paths.prds}}/. Use when starting a new feature or change.
argument-hint: <idea>
---

# PRD Writing

Skip steps already satisfied. If user provided a description via arguments, skip to Step 2.

## Input

The argument is: $ARGUMENTS

If the argument is empty, go straight to Step 1 (gather problem description). After gathering the idea, derive the slug from the idea.

If the argument is provided, convert it to a kebab-case slug (lowercase, spaces and underscores replaced with hyphens). This is `<slug>`. The output file is `{{paths.prds}}/<slug>.md`.

If `{{paths.prds}}/<slug>.md` already exists, tell the user and ask whether to overwrite or pick a new name.

## Workflow

### 1. Gather problem description

Ask the user for a detailed description of the problem and any solution ideas.

### 2. Explore codebase

Verify assertions and map current state: data models, services, API routes, frontend structure, and test patterns. Note what exists vs. what must be built.

**Research protocol**: codebase first, then project docs. If you cannot verify a technical claim from these sources, flag it as uncertain — never fabricate.

### 3. Interview

Interview relentlessly, one question at a time. Lead with your recommended answer; let the user confirm or correct. If a question can be answered by exploring code, explore instead of asking. For terse answers, offer concrete options (A/B/C).

Walk these branches (skip any already resolved):

- **Scope & Surface** — Where does this live? New page/view or integrated? Which user roles?
- **Data & Concepts** — Precise definitions for each new concept. What data exists, what's missing?
- **Behavior & Interaction** — How does the user interact? Sorting, filtering, search, time ranges?
- **Display & Output** — Numbers, tables, charts, forms? Exportable? URL-driven state?
- **Access & Privacy** — Who sees what? Role-based restrictions? Sensitive data concerns?
- **Boundaries** — What is explicitly out of scope? Adjacent features to defer?
- **Integration** — Schema changes? New or extended services? External dependencies?

### 3b. Gray area checkpoint

Before continuing, list any unresolved ambiguities from the interview — vague answers, contradictions, assumptions you made without confirmation. Present them as a numbered list:

```
Gray areas found:
1. <ambiguity> — assumed <X>, confirm?
2. <ambiguity> — two options: A or B
```

If the list is empty, say so and move on. Otherwise, resolve each item with the user before proceeding.

### 4. Design modules

Sketch major modules to build or modify. Favor **deep modules** — a simple interface (1–3 entry points) hiding a large implementation that rarely changes, over shallow modules where the interface is nearly as complex as the implementation.

Signals of shallow design: many small functions with 1:1 query mapping, callers compose multiple calls, adding a feature requires changing the interface.

Present modules to user. Confirm which need tests.

### 5. Write PRD

Save to `{{paths.prds}}/<slug>.md` (create `{{paths.prds}}/` if missing).

```markdown
---
created: <current UTC timestamp, ISO 8601, e.g. 2025-06-15T14:30:00Z>
status: created
---

# Feature Name

## Problem Statement

The problem from the user's perspective. Focus on pain and impact.

## Current State

What exists today that this feature changes or builds on. Skip for greenfield.

- Relevant modules, services, or UI surfaces already in place
- Current behavior the user experiences
- Known limitations or workarounds

## Solution

The solution from the user's perspective. Describe the experience, not the architecture.

## User Stories

Long numbered list. Cover happy path, edge cases, error states.

1. As a <actor>, I want <feature>, so that <benefit>

## Implementation Decisions

### New Modules

- Module name, purpose, and public interface (function signatures with param types)
- Why each module exists as a separate unit

### Architectural Decisions

- Key definitions (precise meaning of domain terms)
- Data flow from storage to display
- State management approach

### Schema Changes

- New tables/columns needed, or "None required"

### API Contracts

- New routes, request/response shapes

### Navigation

- Where the feature is accessed, new routes added

Do NOT include file paths or code snippets — they go stale.

## Testing Decisions

- What makes a good test (behavior, not implementation)
- Which modules need tests
- Key test cases (empty state, boundaries, isolation)
- Prior art: similar test patterns in the codebase

## Out of Scope

Explicit list. Be specific — vague exclusions invite scope creep.
```

Tell the user: file created, one-line summary, next step is `/tk:plan <slug>`.

## Error Handling

- `{{paths.prds}}/` missing — create it
- Scope larger than expected — surface and re-scope with user before continuing
