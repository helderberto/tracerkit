# Simplify Metadata & Status Management

## Architectural Decisions

Durable decisions that apply across all phases:

- **Zero frontmatter**: state derived from checkboxes + file existence, no YAML metadata
- **Convention-based linking**: PRD and plan share filename (`prds/X.md` <> `plans/X.md`)
- **Flexible input**: skills accept `@` references, direct paths, or slugs
- **Phase = unit of work**: each phase is a vertical slice, first incomplete phase = cursor
- **Zero TypeScript changes**: CLI just copies skill files, no runtime logic for status
- **Zero test changes**: existing tests already aligned

---

## Phase 1 — Check and brief work without frontmatter

**User stories**: verify implementation without status fields, discover active plans without metadata

### What to build

Rewrite `skills/check/SKILL.md`: remove feature dashboard frontmatter parsing, status transition logic, verdict block appending, PRD/plan frontmatter updates. Check only verifies `[x]` items against codebase and unmarks failures.

Rewrite `skills/brief/SKILL.md`: remove frontmatter parsing, age calculation, status column, status-based focus selection. Brief globs plans, counts checkboxes per phase, shows first incomplete phase as cursor.

### Done when

- [x] `skills/check/SKILL.md` contains zero references to frontmatter, status, verdict blocks, or `completed` field
- [x] `skills/brief/SKILL.md` contains zero references to frontmatter, status, `created`, or age calculation
- [x] Brief output format shows phase progress with `>` cursor on first incomplete phase
- [x] Check describes unmark behavior (`[x]` -> `[ ]` on verification failure)

---

## Phase 2 — Full creation workflow is frontmatter-free

**User stories**: create PRDs and plans as pure markdown, no metadata ceremony

### What to build

Rewrite `skills/prd/SKILL.md`: remove frontmatter block generation (`created`, `status`). PRD output is pure markdown.

Rewrite `skills/plan/SKILL.md`: remove "Update PRD status" step, remove plan frontmatter generation (`source_prd`, `slug`, `status`), remove backlink logic (`plan:` field in PRD). Plan output is pure markdown with phased checkboxes.

Review `skills/build/SKILL.md`: confirm no frontmatter references. Update if needed.

### Done when

- [x] `skills/prd/SKILL.md` generates PRDs with zero frontmatter
- [x] `skills/plan/SKILL.md` contains zero references to status transitions, PRD frontmatter updates, or `source_prd`/`slug`/`status` fields
- [x] `skills/build/SKILL.md` contains zero frontmatter references
- [x] Plan output format uses `## Phase N — <Goal>` headings with checkbox lists

---

## Phase 3 — Docs, README, and artifact migration

**User stories**: documentation reflects the new stateless workflow, existing artifacts are clean

### What to build

Delete `docs/metadata-lifecycle.md`. Update `README.md` (workflow example, skills table, brief example, docs table). Update `docs/examples.md`, `docs/copilot-setup.md`, `docs/gemini-cli-setup.md`. Strip frontmatter from existing `.tracerkit/prds/*.md` and `.tracerkit/plans/*.md`. Run `/revise` on all updated docs.

### Done when

- [x] `docs/metadata-lifecycle.md` does not exist
- [x] `README.md` workflow example shows `@` references, no status fields
- [x] `README.md` skills table has no mention of "status updated"
- [x] `README.md` docs table has no metadata lifecycle link
- [x] `docs/examples.md` walkthroughs show no frontmatter
- [x] All `.tracerkit/prds/*.md` files have zero `---` frontmatter blocks
- [x] All `.tracerkit/plans/*.md` files have zero `---` frontmatter blocks or verdict blocks

---

## Out of Scope

- TypeScript source code changes (CLI is stateless, just copies skills)
- Test changes (existing tests already aligned)
- GitHub backend features (separate PRD)
- Removing `/tk:brief` as a skill (keep for now, can remove later)

## Open Questions

None — all resolved during brainstorming.
