# TracerKit

A spec-driven workflow for Claude Code. Three skills take a feature from idea to verified archive: define, plan, verify.

**Zero runtime dependencies** — pure Markdown skills, no build step.

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

### 3. Manage your installation

```bash
npx tracerkit update              # refresh to latest, skip modified files
npx tracerkit uninstall           # remove TracerKit skills
```

<details>
<summary>Install per-project instead</summary>

To scope skills to a single project (team members get them via git):

```bash
npx tracerkit init .              # install to .claude/skills/ in current dir
npx tracerkit init /path/to/proj  # or specify a path
```

Per-project commands:

```bash
npx tracerkit update .
npx tracerkit uninstall .
```

</details>

## Skills

### `/tk:prd <idea>` — Write a PRD

Interactive interview to define a feature. Explores the codebase, asks scoping questions one at a time, designs deep modules, and writes a structured PRD.

**Output:** `prds/<slug>.md`

### `/tk:plan <slug>` — Create an implementation plan

Reads a PRD and breaks it into phased **tracer-bullet vertical slices** — each phase is a thin but complete path through every layer (schema, service, API, UI, tests), demoable on its own.

**Output:** `plans/<slug>.md`

### `/tk:verify <slug>` — Verify and archive

Read-only review that compares the codebase against the plan's done-when conditions. Runs tests, checks user stories, and stamps a **PASS** or **NEEDS_WORK** verdict. On PASS, automatically archives the PRD and plan to `archive/<slug>/`.

**Output:** Verdict block in `plans/<slug>.md` — on PASS: `archive/<slug>/prd.md` + `archive/<slug>/plan.md`

## Why TracerKit?

Most planning tools break work into horizontal task lists: "set up the database", "build the API", "add the UI". Nothing works end-to-end until everything is done. And without shared artifacts, AI coding sessions drift, scope creeps, and context gets lost between conversations.

TracerKit uses **tracer-bullet vertical slices** instead. Every phase is a **vertical slice** — a thin but complete path through every layer of the stack (schema → service → API → UI → tests). Each phase is demoable on its own. Think of it as firing a tracer bullet through the entire system to light up the path before committing to full implementation.

Why this matters for AI-assisted development:

- **Early feedback** — each slice produces a working feature you can test and show, not just a checked-off task
- **Reduced risk** — integration problems surface in phase 1, not at the end
- **Natural checkpoints** — each phase is a safe point to pause, switch sessions, or change direction
- **Context-friendly** — AI assistants work better with small, well-scoped phases than with large horizontal layers

The term comes from [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/) — TracerKit applies it as a first-class planning model for AI workflows.

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

```bash
# 1. Define the feature
/tk:prd add dark mode support

# 2. Break into phased vertical slices
/tk:plan dark-mode-support

# 3. Implement each phase with Claude

# 4. Verify — auto-archives on PASS
/tk:verify dark-mode-support
```

</details>

<details>
<summary>Iterating on an accepted PRD</summary>

PRDs are living documents — refine them any time before or during implementation.

```bash
# Re-run the PRD skill — it detects the existing file and asks
# whether to start fresh or revise
/tk:prd update dark mode to detect system preference

# Regenerate the plan from the updated PRD
/tk:plan dark-mode-support
```

</details>

<details>
<summary>Verify → fix → re-verify loop</summary>

```bash
# First verification attempt
/tk:verify dark-mode-support
# → NEEDS_WORK: missing toggle persistence, 2 failing tests

# Fix the blockers, then re-verify
/tk:verify dark-mode-support
# → PASS — auto-archived to archive/dark-mode-support/
```

</details>

<details>
<summary>Development flow diagram</summary>

```
                         +------------------+
                         |   Idea / Issue   |
                         +--------+---------+
                                  |
                                  v
                       +----------+----------+
                       |  /tk:prd <idea>     |
                       |  Interview + Design |
                       +----------+----------+
                                  |
                              prds/<slug>.md
                                  |
                                  v
                       +----------+----------+
                       |  /tk:plan <slug>    |
                       |  Vertical Slices    |
                       +----------+----------+
                                  |
                             plans/<slug>.md
                                  |
                                  v
                       +----------+----------+
                       |   Implement phases  |
                       |   (you + Claude)    |
                       +----------+----------+
                                  |
                                  v
                       +----------+----------+
                       |  /tk:verify <slug>  |
                       |  Review + archive   |
                       +----------+----------+
                                  |
                         +--------+--------+
                         |                 |
                    NEEDS_WORK           PASS
                         |                 |
                         v                 v
                  Fix blockers      Auto-archived
                  then re-run       to archive/
                  /tk:verify
```

</details>

## Contributing

1. Fork the repo and create a feature branch
2. Use TracerKit itself to plan your change (`/tk:prd` + `/tk:plan`)
3. Implement following the plan phases
4. `npm run lint:fix && npm run test:run && npm run typecheck`
5. [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint)
6. Open a PR against `main`

## License

[MIT License](LICENSE) © [helderberto](https://helderberto.com)
