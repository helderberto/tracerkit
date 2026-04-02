# Plan: tk:brief — Session Briefing Skill

> Source PRD: `.tracerkit/prds/tk-brief.md`

## Architectural Decisions

- `brief(cwd: string): string[]` — same signature as `progress` and `archive`; pure function over filesystem, returns lines printed to stdout
- Reuses `parsePlan` (`src/plan.ts`) and `parseFrontmatter` (`src/frontmatter.ts`) — no new parsing modules
- First unchecked item text: `brief.ts` scans plan lines directly for the first `- [ ]` match and strips the prefix — `parsePlan` only counts, doesn't return text
- `cli.ts` wiring: `case 'brief'` uses `resolveTarget(rest, process.cwd())` — no slug argument
- `templates.test.ts` hardcodes `toHaveLength(3)` in multiple assertions — must be updated to 4 when `tk:brief` skill is added

---

## Phase 1 — `brief()` function: scan, parse, format

**User stories**: 1, 2, 4, 5, 6, 7, 9

### What to build

`src/commands/brief.ts` — `brief(cwd: string): string[]` that scans all PRD files in `config.paths.prds`, parses frontmatter and plan for each, computes progress and first unchecked item, and returns a formatted markdown table + Focus line.

Table columns: Feature (slug), Status (from frontmatter or `unknown`), Age (human-readable since `created`: `0d`, `Nd`, `Nw`, `Nmo`, blank if missing), Progress (`checked/total` from plan or `—`), Next (first `- [ ]` text stripped of prefix, or `—`).

Features with `status: done` are excluded. Features with a plan but no frontmatter show progress and `unknown` status. Focus line: auto-selects if exactly 1 `in_progress`; otherwise selects oldest by `created` (no `created` sorts last).

### Done when

- [ ] `brief(cwd)` scans `config.paths.prds`, returns "No features found — run `/tk:prd` to start one." when dir is missing or empty
- [ ] Excludes features with `status: done`; features without frontmatter show as `unknown`
- [ ] Table rows include Feature, Status, Age, Progress (`N/M` from plan or `—`), Next (first unchecked item text or `—`)
- [ ] Focus line auto-selects single `in_progress`; picks oldest by `created` when 0 or 2+ `in_progress`
- [ ] Tests cover: empty dir, single in_progress auto-focus, multiple in_progress oldest-focus, no frontmatter with plan, no plan, done excluded, age formatting [agent:test-auditor]

---

## Phase 2 — CLI wiring + skill template

**User stories**: 3, 8, 10

### What to build

Wire `brief` into `cli.ts` as a no-slug command. Add `tk:brief` skill to `templates/.claude/skills/`. Update `templates.test.ts` to expect 4 templates.

`tk:brief/SKILL.md` calls `npx tracerkit brief` and presents the output. Uses `{{paths.prds}}` and `{{paths.plans}}` placeholders so custom paths work after `tracerkit update`.

### Done when

- [ ] `brief` wired into `cli.ts` as `case 'brief'` using `resolveTarget(rest, process.cwd())`
- [ ] USAGE string updated with `brief [path]` entry
- [ ] `brief` exported from `src/commands/index.ts`
- [ ] `templates/.claude/skills/tk:brief/SKILL.md` created with `{{paths.prds}}` and `{{paths.plans}}` placeholders
- [ ] `templates.test.ts` updated: all `toHaveLength(3)` → `4`; `tk:brief` included in `copyTemplates` and `diffTemplates` assertions [agent:test-auditor]

---

## Phase 3 — Docs and usage examples

**User stories**: 1, 3, 8

### What to build

Update `docs/cli-reference.md` with the new `tracerkit brief` command entry. Update `docs/examples.md` to show `/tk:brief` in the workflow — both as a standalone session-start example and integrated into the full walkthrough. No new doc files needed.

### Done when

- [ ] `docs/cli-reference.md` includes `tracerkit brief [path]` row with description
- [ ] `docs/examples.md` shows a `/tk:brief` standalone example (fresh session, table output, Focus line)
- [ ] `docs/examples.md` full walkthrough updated to reference `/tk:brief` as the session-start step

---

## Out of Scope

- Arguments or filtering (always scans all active PRDs)
- Interactive mode (selecting a feature from the table to act on)
- Prose narrative output
- Verdict/blocker data (that's `tk:check`)
- Writing or modifying any files

## Open Questions

None — all decisions resolved during planning.
