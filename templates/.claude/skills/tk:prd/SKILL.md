---
description: Create a PRD through user interview, codebase exploration, and module design, saved to {{paths.prds}}/. Use when starting a new feature or change.
argument-hint: <idea>
---

# PRD Writing

Skip steps already satisfied. If user provided a description via arguments, skip to Step 2.

## Pre-loaded context

- Existing PRDs: !`ls {{paths.prds}}/ 2>&1`

## Input

The argument is: $ARGUMENTS

If the argument is empty, go straight to Step 1 (gather problem description). After gathering the idea, derive the slug from the idea.

If the argument is provided, derive a slug using this exact algorithm:

1. Take only the text before the first `—` or `–` (if present)
2. Lowercase the text
3. Remove filler words: a, an, the, for, of, to, in, on, with, and, or, but, is, be
4. Take the first 4 remaining words (or fewer if less exist)
5. Join with hyphens → `<slug>`

The output file is `{{paths.prds}}/<slug>.md`.

If `{{paths.prds}}/<slug>.md` already exists, tell the user and ask whether to overwrite or pick a new name.

## Workflow

### 1. Gather problem description

Ask the user for a detailed description of the problem and any solution ideas.

### 2. Explore codebase

Verify assertions and map current state: data models, services, API routes, frontend structure, and test patterns. Note what exists vs. what must be built.

**Research protocol**: codebase first, then project docs. If you cannot verify a technical claim from these sources, flag it as uncertain — never fabricate.

### 3. Interview

Interview relentlessly, one question at a time. Lead with your recommended answer; let the user confirm or correct. If a question can be answered by exploring code, explore instead of asking. For terse answers, offer concrete options (A/B/C).

Walk these branches. **Skip rule**: skip a branch when the project type makes it irrelevant (e.g., skip Display/Access/Navigation for CLIs and libraries) AND the user's idea does not mention it.

- **Scope & Surface** — Where does this live? New page/view or integrated? Which user roles? _Skip if_: single-surface project (CLI, library) with no new entry points.
- **Data & Concepts** — Precise definitions for each new concept. What data exists, what's missing? _Never skip_ — every feature has data.
- **Behavior & Interaction** — How does the user interact? Sorting, filtering, search, time ranges? _Skip if_: feature is purely internal/backend with no user-facing behavior change.
- **Display & Output** — Numbers, tables, charts, forms? Exportable? URL-driven state? _Skip if_: no UI or formatted output involved.
- **Access & Privacy** — Who sees what? Role-based restrictions? Sensitive data concerns? _Skip if_: single-user project with no auth layer.
- **Boundaries** — What is explicitly out of scope? Adjacent features to defer? _Never skip_ — scope control prevents creep.
- **Integration** — Schema changes? New or extended services? External dependencies? _Skip if_: self-contained change touching no external systems or storage.

### 3b. Gray area checkpoint

Before continuing, scan the interview for gray areas. Something is a gray area if any of these are true:

- **Vague answer**: user said "maybe", "probably", "I think", or gave a one-word answer to a multi-part question
- **Contradiction**: two answers conflict (e.g., "no auth needed" but "only admins can access")
- **Unstated assumption**: you filled in a detail the user never confirmed
- **Ambiguous scope**: a feature boundary is unclear (could be in or out of scope)

Present as a numbered list:

```
Gray areas found:
1. <ambiguity> — assumed <X>, confirm?
2. <ambiguity> — two options: A or B
```

If the list is empty, say "No gray areas found" and move on. Otherwise, resolve each item with the user before proceeding.

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

Omit any section whose content would be "None required" — only include sections with actual content.

## Testing Decisions

- What makes a good test (behavior, not implementation)
- Which modules need tests
- Key test cases (empty state, boundaries, isolation)
- Prior art: similar test patterns in the codebase

## Out of Scope

Explicit list. Be specific — vague exclusions invite scope creep.
```

Tell the user: file created, one-line summary. Then ask: "Run `/tk:plan <slug>` next?"

## Error Handling

- `{{paths.prds}}/` missing — create it
- Scope larger than expected — surface and re-scope with user before continuing
