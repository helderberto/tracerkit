<div align="center">

# TracerKit

[![CI](https://github.com/helderberto/tracerkit/actions/workflows/ci.yml/badge.svg)](https://github.com/helderberto/tracerkit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tracerkit)](https://www.npmjs.com/package/tracerkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Spec-driven workflow for Claude Code: from idea to product requirements to executable plan.

**Zero runtime dependencies** — pure Markdown skills, no build step.

</div>

## Get Started

### 1. Install TracerKit

```bash
npx tracerkit init
```

Skills are installed globally to `~/.claude/skills/` — available in every project, no per-project setup needed.

### 2. Use the skills

Open Claude Code in any project and start using:

```bash
/tk:prd add dark mode support     # define the feature
/tk:plan dark-mode-support        # break into vertical slices
/tk:verify dark-mode-support      # verify and archive
```

### 3. CLI Reference

| Command                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `tracerkit init`           | Install skills to `~/.claude/skills/`          |
| `tracerkit init <path>`    | Install skills to a specific project directory |
| `tracerkit update`         | Refresh to latest version, skip modified files |
| `tracerkit update --force` | Replace modified files with latest versions    |
| `tracerkit uninstall`      | Remove TracerKit skills, keep user artifacts   |
| `tracerkit --version`      | Print version                                  |

All commands default to the home directory. Pass a path or use `--global` explicitly to target `~/`.

<details>
<summary>Per-project usage</summary>

To scope skills to a single project (team members get them via git):

```bash
npx tracerkit init .              # install to .claude/skills/ in current dir
npx tracerkit update .            # update project-scoped skills
npx tracerkit uninstall .         # remove project-scoped skills
```

</details>

## Skills

### Core skills

The three-step workflow that takes a feature from idea to verified archive.

#### `/tk:prd <idea>` — Write a PRD

Interactive interview to define a feature. Explores the codebase, asks scoping questions one at a time, designs deep modules, and writes a structured PRD.

**Output:** `prds/<slug>.md`

#### `/tk:plan <slug>` — Create an implementation plan

Reads a PRD and breaks it into phased **tracer-bullet vertical slices** — each phase is a thin but complete path through every layer (schema, service, API, UI, tests), demoable on its own.

**Output:** `plans/<slug>.md`

#### `/tk:verify <slug>` — Verify and archive

Read-only review that compares the codebase against the plan's done-when conditions. Runs tests, checks user stories, and stamps a **PASS** or **NEEDS_WORK** verdict. On PASS, automatically archives the PRD and plan to `archive/<slug>/`.

**Output:** Verdict block in `plans/<slug>.md` — on PASS: `archive/<slug>/prd.md` + `archive/<slug>/plan.md`

### Helper skills

Useful but optional — this category will grow over time.

#### `/tk:status` — Workflow dashboard

Scans `prds/` and prints a table of all features grouped by status (`in_progress`, `created`, `done`), with age, latest verdict, and blocker/suggestion counts. Read-only — no files are modified.

## Metadata Lifecycle

Each PRD carries YAML frontmatter that tracks its position in the workflow. The skills update it automatically — you never need to edit it by hand.

**Fields:**

- `created` — ISO 8601 UTC timestamp, set when the PRD is written
- `status` — `created` | `in_progress` | `done`
- `completed` — ISO 8601 UTC timestamp, set when verification passes

**How it changes:**

| Stage    | Skill               | Frontmatter                                          |
| -------- | ------------------- | ---------------------------------------------------- |
| Defined  | `/tk:prd`           | `created: 2025-06-15T14:30:00Z`<br>`status: created` |
| Planning | `/tk:plan`          | `status: in_progress`                                |
| Verified | `/tk:verify` (PASS) | `status: done`<br>`completed: 2025-06-20T09:00:00Z`  |

<details>
<summary>Example frontmatter at each stage</summary>

After `/tk:prd`:

```yaml
---
created: 2025-06-15T14:30:00Z
status: created
---
```

After `/tk:plan`:

```yaml
---
created: 2025-06-15T14:30:00Z
status: in_progress
---
```

After `/tk:verify` (PASS):

```yaml
---
created: 2025-06-15T14:30:00Z
status: done
completed: 2025-06-20T09:00:00Z
---
```

</details>

## Why TracerKit?

Most planning tools produce horizontal task lists — nothing works until everything is done. TracerKit uses **tracer-bullet vertical slices** instead: each phase cuts through every layer (schema → service → API → UI → tests), so every phase is demoable on its own. Integration problems surface early, context stays focused, and AI assistants get small well-scoped phases instead of sprawling layers.

The term comes from [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/).

### Compared to

**vs. [Spec Kit](https://github.com/github/spec-kit)** (GitHub) — Thorough but heavyweight. 5 phases, Python setup, rigid phase gates. TracerKit is 3 phases, zero deps, automated verification.

**vs. [Kiro](https://kiro.dev/)** (AWS) — Powerful but locked to a dedicated IDE. TracerKit works inside Claude Code with pure Markdown skills.

**vs. [OpenSpec](https://github.com/Fission-AI/OpenSpec)** — Similar philosophy, broader tool support. TracerKit trades breadth (Claude Code only) for depth — native skill discovery, subagents for verification, and fewer artifacts.

**vs. nothing** — AI coding without specs means vague prompts and lost context between sessions. TracerKit adds structure without ceremony.

<details>
<summary>Full comparison table</summary>

|                  | Spec Kit         | Kiro                       | OpenSpec                | TracerKit                          |
| ---------------- | ---------------- | -------------------------- | ----------------------- | ---------------------------------- |
| **What it is**   | CLI + extensions | Agentic IDE (VS Code fork) | Slash-command framework | Claude Code skills (pure Markdown) |
| **Setup**        | Python + uv      | Dedicated IDE              | npm + init              | `npx tracerkit init`               |
| **Phases**       | 5                | 3                          | 3                       | 3 (prd, plan, verify)              |
| **Artifacts**    | 4 files          | 3+ files                   | 4+ files                | 2 files (PRD, plan)                |
| **Verification** | Manual gates     | Diff approval              | Manual                  | Automated PASS/NEEDS_WORK          |
| **Tool lock-in** | Any AI assistant | Kiro IDE only              | Any AI assistant        | Claude Code only                   |
| **Runtime deps** | Python + uv      | Proprietary IDE            | None                    | None                               |

</details>

## Examples

<details>
<summary>New feature from scratch</summary>

```
You: /tk:prd add dark mode support
AI:  Starting PRD interview...
     ? What problem does this solve for users?
     ? Should it detect system preference or manual toggle only?
     ? Which components need theming?
     ...
     ✓ Written prds/dark-mode-support.md

You: /tk:plan dark-mode-support
AI:  Reading PRD...
     ✓ Phase 1 — CSS variables + ThemeProvider (schema → context → tests)
     ✓ Phase 2 — Toggle component + localStorage (UI → persistence → tests)
     ✓ Phase 3 — System preference detection (media query → sync → tests)
     Written plans/dark-mode-support.md

You: # implement each phase with Claude...

You: /tk:verify dark-mode-support
AI:  Verifying against plan...
     ✓ All done-when conditions met
     ✓ Tests passing
     PASS — archived to archive/dark-mode-support/
```

</details>

<details>
<summary>Iterating on an accepted PRD</summary>

```
You: /tk:prd update dark mode to detect system preference
AI:  Found existing prds/dark-mode-support.md
     ? Start fresh or revise the existing PRD?
     ...
     ✓ Updated prds/dark-mode-support.md

You: /tk:plan dark-mode-support
AI:  Reading updated PRD...
     ✓ Regenerated plans/dark-mode-support.md with new scope
```

</details>

<details>
<summary>Verify → fix → re-verify loop</summary>

```
You: /tk:verify dark-mode-support
AI:  Verifying against plan...
     ✗ Missing toggle persistence in localStorage
     ✗ 2 failing tests in ThemeProvider.test.ts
     NEEDS_WORK — 2 blockers found

You: # fix the blockers...

You: /tk:verify dark-mode-support
AI:  Verifying against plan...
     ✓ All done-when conditions met
     ✓ Tests passing
     PASS — archived to archive/dark-mode-support/
```

</details>

<details>
<summary>Check workflow status</summary>

```
You: /tk:status
AI:  Feature Status Dashboard
     ┌──────────────────────┬─────────────┬─────┐
     │ Feature              │ Status      │ Age │
     ├──────────────────────┼─────────────┼─────┤
     │ dark-mode-support    │ in_progress │ 3d  │
     │ api-rate-limiting    │ created     │ 1d  │
     │ user-avatars         │ done        │ 7d  │
     └──────────────────────┴─────────────┴─────┘
```

</details>

## Contributing

1. Fork the repo and create a feature branch
2. Use TracerKit itself to plan your change (`/tk:prd` + `/tk:plan`)
3. Implement following the plan phases
4. `npm run lint:fix && npm run test:run && npm run typecheck`
5. [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint)
6. Open a PR against `main`

## Support

For support, please [open a GitHub issue](https://github.com/helderberto/tracerkit/issues). We welcome bug reports, feature requests, and questions.

## License

[MIT License](LICENSE) © [helderberto](https://helderberto.com)
