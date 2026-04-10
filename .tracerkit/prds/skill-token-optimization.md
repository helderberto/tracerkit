# Skill Token Optimization

## Problem

Skills consume ~6500 tokens total. ~25% is waste: duplicated blocks, over-explained sections, instructions LLMs follow naturally. Less tokens = faster responses, lower cost, same results.

## Current token breakdown

| Skill           | Tokens (est.) | Biggest sections                                                                 |
| --------------- | ------------- | -------------------------------------------------------------------------------- |
| prd             | ~1800         | PRD body template (300), interview branches (200), gray area (120)               |
| plan            | ~1700         | Deriving tasks table (100), vertical slice rules (200), plan body template (150) |
| check           | ~1800         | Archive steps (350), progress algorithm (150), subagent instructions (150)       |
| brief           | ~800          | Progress algorithm (150), discover features (150)                                |
| Shared overhead | ~400          | Storage preamble (80x4), research protocol (40x2)                                |
| **Total**       | **~6500**     |                                                                                  |

## Changes (ordered by impact)

### 1. Delete all Error Handling sections (~250 tokens saved)

Every skill has an Error Handling section with obvious recovery steps ("dir missing — create it", "file not found — list and ask"). LLMs do this by default. Remove entirely from all 4 skills.

### 2. Compress storage preamble 4x → 1 line (~200 tokens saved)

Current (80 tokens, repeated 4x = 320):

```
## Storage
Read `.tracerkit/config.json` in the project root. If absent, use `local`.
- **`local`** (default): follow `<!-- if:local -->` blocks, ignore `<!-- if:github -->` blocks
- **`github`**: follow `<!-- if:github -->` blocks, ignore `<!-- if:local -->` blocks. Use `github.repo` from config (or auto-detect from git remote). Labels default to `tk:prd`/`tk:plan` but may be overridden in config.
```

Replace with (~30 tokens each = 120):

```
**Config**: read `.tracerkit/config.json` (default: `local`). Follow matching `<!-- if:local/github -->` blocks. GitHub: use `github.repo` from config or git remote.
```

### 3. Flatten PRD body template (~200 tokens saved)

Current: each section has explanatory prose ("The problem from the user's perspective. Focus on pain and impact."). LLM knows what "Problem Statement" means.

Replace with terse structure, hints only where non-obvious:

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
Omit empty sections. No file paths or code snippets.
## Testing Decisions (behavior tests, key cases, prior art)
## Out of Scope (be specific)
```

### 4. Flatten interview branches into table (~120 tokens saved)

Current: 7 branches with full prose skip rules.

Replace with:

```
| Branch | Key questions | Skip when |
|--------|--------------|-----------|
| Scope & Surface | Where? New page or integrated? Roles? | CLI/library, no new entry points |
| Data & Concepts | Definitions, existing vs missing data | Never skip |
| Behavior | Interaction patterns, filtering, search | No user-facing behavior |
| Display | Numbers, tables, charts, exports | No UI |
| Access & Privacy | Who sees what? Sensitive data? | Single-user, no auth |
| Boundaries | Out of scope, deferred features | Never skip |
| Integration | Schema, services, external deps | Self-contained change |
```

### 5. Delete obvious LLM instructions (~150 tokens saved)

Remove:

- "If the list is empty, say 'No gray areas found' and move on"
- "If the PRD has no frontmatter, skip this step silently"
- "Tell the user: file created, one-line summary. Then ask..."
- "Tell the user: issue created (include issue number and URL)..."
- "After the table, ask which feature to verify"

LLMs do these naturally. The output format (verdict block, table) is enough guidance.

### 6. Compress gray area checkpoint (~80 tokens saved)

Current: 4 defined conditions + format template (~120 tokens).

Replace with:

```
### 3b. Gray areas
Surface ambiguities, contradictions, unstated assumptions. Present numbered list. Resolve all before continuing.
```

### 7. Compress archive steps (~150 tokens saved)

Current: 8 detailed sub-steps with frontmatter editing instructions for local.

Replace with:

```
Archive to `.tracerkit/archives/<slug>/`:
1. Copy PRD → `prd.md` (set `status: done`, add `completed` timestamp in frontmatter)
2. Copy plan → `plan.md` (append `## Archived` with date)
3. Delete originals
```

### 8. Deduplicate progress algorithm (~150 tokens saved)

Identical algorithm in check + brief. Options:

- A) Define once in check, reference from brief ("use same algorithm as /tk:check")
- B) Compress to shorter form in both

Recommend B — compress to:

```
Progress: count `- [x]` and `- [ ]` lines under each `## Phase N` heading. Sum → `checked/total`.
```

### 9. Tighten prose throughout (~300 tokens saved)

General pass: remove filler, compress sentences, sacrifice grammar for brevity. Examples:

- "Understand current architecture, existing patterns, and integration points" → "Map architecture, patterns, integration points"
- "If you already have codebase context from a prior step in this conversation (e.g., you just ran /tk:prd), skip the exploration and note which context you're reusing" → "Skip if codebase context exists from prior step"
- "Each phase is a thin tracer bullet — a narrow but complete path through every integration layer (schema, service, API, UI, tests). A completed phase is demoable on its own." → "Each phase: thin vertical slice through all layers (schema → service → API → UI → tests). Demoable alone."

## Expected result

| Metric           | Before | After | Change |
| ---------------- | ------ | ----- | ------ |
| Total tokens     | ~6500  | ~4900 | -25%   |
| Error handling   | ~250   | 0     | -100%  |
| Storage preamble | ~320   | ~120  | -63%   |
| PRD template     | ~300   | ~100  | -67%   |

Same output quality. Same skill behavior. Fewer tokens per invocation.

## Out of Scope

- Changing skill behavior or output format
- Removing conditional blocks (local/github)
- Restructuring skill workflow steps
- Changing PRD/plan document structure
