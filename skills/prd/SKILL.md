---
description: Create a PRD through user interview, codebase exploration, and module design. Use when starting a new feature or change.
argument-hint: <idea>
---

**Config**: read `.tracerkit/config.json` (default: `local`). Follow matching `<!-- if:local/github -->` blocks. GitHub: use `github.repo` from config or git remote.

# PRD Writing

Skip satisfied steps. If argument provided, skip to Step 2.

## Pre-loaded context

<!-- if:local -->

- Existing PRDs: !`ls .tracerkit/prds/*.md 2>/dev/null || echo "(none)"`
  <!-- end:local -->
  <!-- if:github -->
- Existing PRDs: list open GitHub Issues with label `{{github.labels.prd}}`
<!-- end:github -->

## Input

The argument is: $ARGUMENTS

If empty, go to Step 1; derive slug after gathering the idea. If provided, derive slug:

1. Take only the text before the first `—` or `–` (if present)
2. Strip leading command verbs: create, build, implement, add, update, fix, make, write, plan, get, show, support
3. Lowercase the text
4. Remove filler words: a, an, the, for, of, to, in, on, with, and, or, but, is, be
5. Take the first 4 remaining words (or fewer if less exist)
6. Join with hyphens → `<slug>`

<!-- if:local -->

Output: `.tracerkit/prds/<slug>.md`. If exists, ask: overwrite or new name?

<!-- end:local -->
<!-- if:github -->

Output: GitHub Issue with label `{{github.labels.prd}}`, title `[{{github.labels.prd}}] <slug>: <Feature Title>`. If matching issue exists, ask: update or new slug?

<!-- end:github -->

## Workflow

### 1. Gather problem description

Ask the user for a detailed description of the problem and any solution ideas.

### 2. Explore codebase

Map current state: data models, services, API routes, frontend, tests. Note exists vs. must build.

**Research protocol**: codebase first, then docs. Unverifiable claims → flag as uncertain, never fabricate.

### 3. Interview

One question at a time. Lead with your recommended answer. Explore code instead of asking when possible. Offer A/B/C for terse answers.

| Branch           | Key questions                           | Skip when                        |
| ---------------- | --------------------------------------- | -------------------------------- |
| Scope & Surface  | Where? New page or integrated? Roles?   | CLI/library, no new entry points |
| Data & Concepts  | Definitions, existing vs missing data   | Never skip                       |
| Behavior         | Interaction patterns, filtering, search | No user-facing behavior          |
| Display          | Numbers, tables, charts, exports        | No UI                            |
| Access & Privacy | Who sees what? Sensitive data?          | Single-user, no auth             |
| Boundaries       | Out of scope, deferred features         | Never skip                       |
| Integration      | Schema, services, external deps         | Self-contained change            |

### 3b. Gray areas

Surface ambiguities, contradictions, unstated assumptions. Present numbered list. Resolve all before continuing.

### 4. Design modules

Sketch modules. Favor **deep modules** — simple interface (1-3 entry points) hiding large implementation over shallow modules where interface ≈ implementation.

Shallow signals: many small 1:1 functions, callers compose multiple calls, feature changes require interface changes.

Present modules. Confirm which need tests.

### 5. Write PRD

<!-- if:local -->

Save to `.tracerkit/prds/<slug>.md` (create dir if missing).

```markdown
---
created: <UTC ISO 8601>
status: created
---

# Feature Name
```

<!-- end:local -->
<!-- if:github -->

Ensure labels exist: `gh label create {{github.labels.prd}} --repo <repo> --force`, `gh label create tk:created --repo <repo> --force`.

Create GitHub Issue — title: `[{{github.labels.prd}}] <slug>: <Feature Title>`, labels: `{{github.labels.prd}}`, `tk:created`.

```markdown
<!-- tk:metadata
slug: <slug>
created: <UTC ISO 8601>
status: created
-->

# Feature Name
```

<!-- end:github -->

PRD body structure (same for local file and issue body). Omit empty sections. No file paths or code snippets.

```
## Problem Statement
## Current State (skip if greenfield)
## Solution (user experience, not architecture)
## User Stories (numbered, cover happy + edge + error)
## Implementation Decisions
### New Modules (name, purpose, interface signatures)
### Architectural Decisions (definitions, data flow, state)
### Schema Changes
### API Contracts
### Navigation
## Testing Decisions (behavior tests, key cases, prior art)
## Out of Scope (be specific)
```

---

Then ask: "Run `/tk:plan <slug>` next?"
