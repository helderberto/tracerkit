# Plan: Skill Token Optimization

> Source PRD: `.tracerkit/prds/skill-token-optimization.md`

## Architectural Decisions

Durable decisions that apply across all phases:

- **No behavior changes** — all optimizations are content compression; skill output, workflow steps, and conditional blocks (`<!-- if:local/github -->`) remain identical
- **Storage preamble** — compress to a single-line form in each skill; don't extract to a shared file (skills must be self-contained)
- **Progress algorithm** — compress to shorter form in both check + brief (option B from PRD); no cross-referencing between skills

---

## Phase 1 — PRD skill compressed

**PRD changes**: #1 (error handling), #2 (storage preamble), #3 (body template), #4 (interview branches), #5 (obvious LLM instructions), #6 (gray area), #9 (prose tightening)

### What to build

Apply all 7 applicable optimizations to `skills/prd/SKILL.md`. Flatten the body template to terse headings with hints only where non-obvious. Replace 7 interview branch prose paragraphs with a single table. Compress gray area checkpoint to 3 lines. Delete error handling section. Remove obvious LLM hand-holding instructions. Compress storage preamble to one-liner. Tighten prose throughout.

### Done when

- [x] Storage preamble is ≤30 tokens (one-liner)
- [x] PRD body template has no explanatory prose per section — hints only where non-obvious
- [x] Interview branches are a single table, not 7 prose paragraphs
- [x] Gray area section is ≤3 lines
- [x] Error Handling section deleted
- [x] No "tell the user" / "if empty, say X" instructions remain

---

## Phase 2 — Plan skill compressed

**PRD changes**: #1 (error handling), #2 (storage preamble), #5 (obvious LLM instructions), #9 (prose tightening)

### What to build

Apply all 4 applicable optimizations to `skills/plan/SKILL.md`. Compress storage preamble to one-liner. Delete error handling section. Remove obvious LLM instructions. Tighten verbose phrases throughout.

### Done when

- [x] Storage preamble is ≤30 tokens (one-liner)
- [x] Error Handling section deleted
- [x] No "tell the user" / "if empty, say X" instructions remain
- [x] Verbose phrases compressed (e.g., "Understand current architecture..." → "Map architecture...")

---

## Phase 3 — Check + Brief skills compressed

**PRD changes**: #1 (error handling), #2 (storage preamble), #5 (obvious LLM instructions), #7 (archive steps), #8 (progress algorithm), #9 (prose tightening)

### What to build

Apply optimizations to both `skills/check/SKILL.md` and `skills/brief/SKILL.md`. Compress archive steps from 8 sub-steps to 3 lines. Compress progress algorithm in both files. Delete error handling section from check. Remove obvious LLM instructions from both. Compress storage preamble to one-liner in both. Tighten prose throughout.

### Done when

- [x] Storage preamble ≤30 tokens in both files
- [x] Check: archive steps are ≤5 lines (was 8 sub-steps)
- [x] Progress algorithm compressed to ≤3 lines in both check and brief
- [x] Check: Error Handling section deleted
- [x] No "tell the user" / "after the table, ask" instructions remain in either file

---

## Out of Scope

- Changing skill behavior or output format
- Removing conditional blocks (local/github)
- Restructuring skill workflow steps
- Changing PRD/plan document structure

## Open Questions

None.
