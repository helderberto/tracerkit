# TracerKit

A spec-driven workflow for Claude Code. Three skills take a feature from idea to verified archive: define, plan, verify.

**Zero runtime dependencies** — pure Markdown skills, no build step.

## Get Started

### 1. Install TracerKit CLI

```bash
npx tracerkit init
```

This scaffolds skills into `.claude/skills/` in your project. Claude Code discovers them automatically.

### 2. Use the skills

```bash
# Define the feature — interactive interview, explores your codebase
/tk:prd add dark mode support

# Break the PRD into phased vertical slices
/tk:plan dark-mode-support

# Implement each phase (work through phases with Claude)

# Verify — auto-archives on PASS
/tk:verify dark-mode-support
```

### 3. Manage your installation

```bash
npx tracerkit update    # refresh to latest, skip modified files
npx tracerkit uninstall # remove TracerKit skills, keep prds/plans/archive
```

## Development Flow

<details>
<summary>Flow diagram</summary>

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

## Examples

<details>
<summary>Iterating on an accepted PRD</summary>

PRDs are living documents — refine them any time before or during implementation.

```bash
# Original PRD exists at prds/dark-mode-support.md
# Scope changed: now need system-preference detection

# Re-run the PRD skill — it detects the existing file and asks
# whether to start fresh or revise
/tk:prd update dark mode to detect system preference

# Regenerate the plan from the updated PRD
/tk:plan dark-mode-support

# Continue implementation from the new plan
```

</details>

<details>
<summary>Verify → fix → re-verify loop</summary>

```bash
# First verification attempt
/tk:verify dark-mode-support
# → NEEDS_WORK: missing toggle persistence, 2 failing tests

# Fix the blockers listed in the verdict
# ...

# Re-verify — previous verdict is replaced
/tk:verify dark-mode-support
# → PASS — auto-archived to archive/dark-mode-support/
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

## Manual Installation

For development or if you prefer symlinks:

```bash
git clone https://github.com/helderberto/tracerkit.git

# Per-project:
mkdir -p .claude/skills
ln -s /path/to/tracerkit/templates/.claude/skills/tk:prd .claude/skills/tk:prd
ln -s /path/to/tracerkit/templates/.claude/skills/tk:plan .claude/skills/tk:plan
ln -s /path/to/tracerkit/templates/.claude/skills/tk:verify .claude/skills/tk:verify

# Or global (available in all projects):
ln -s /path/to/tracerkit/templates/.claude/skills/tk:prd ~/.claude/skills/tk:prd
ln -s /path/to/tracerkit/templates/.claude/skills/tk:plan ~/.claude/skills/tk:plan
ln -s /path/to/tracerkit/templates/.claude/skills/tk:verify ~/.claude/skills/tk:verify
```

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

|                  | [Spec Kit](https://github.com/github/spec-kit) | [Kiro](https://kiro.dev/)  | [OpenSpec](https://github.com/Fission-AI/OpenSpec) | TracerKit                          |
| ---------------- | ---------------------------------------------- | -------------------------- | -------------------------------------------------- | ---------------------------------- |
| **What it is**   | CLI toolkit + extensions                       | Agentic IDE (VS Code fork) | Slash-command framework                            | Claude Code skills (pure Markdown) |
| **Setup**        | Python + uv                                    | Dedicated IDE              | Copy slash commands                                | `npx tracerkit init`               |
| **Phases**       | 5                                              | 3                          | 3                                                  | 3 (prd, plan, verify)              |
| **Artifacts**    | 4 files                                        | 3+ files                   | 4+ files                                           | 2 files (PRD, plan)                |
| **Verification** | Manual phase gates                             | Diff approval              | Manual                                             | Automated PASS/NEEDS_WORK          |
| **Tool lock-in** | Any AI assistant                               | Kiro IDE only              | Any AI assistant                                   | Claude Code only                   |
| **Runtime deps** | Python + uv                                    | Proprietary IDE            | None                                               | None                               |
| **Complexity**   | High                                           | High                       | Low                                                | Low                                |

TracerKit trades breadth (Claude Code only) for depth — native skill discovery, subagents for read-only verification, and the simplest setup with fewest artifacts.

## Contributing

1. Fork the repo and create a feature branch
2. Use TracerKit itself to plan your change (`/tk:prd` + `/tk:plan`)
3. Implement following the plan phases
4. `npm run lint:fix && npm run test:run && npm run typecheck`
5. [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint)
6. Open a PR against `main`

## Author

**Helder Burato Berto** — [github.com/helderberto](https://github.com/helderberto)

## License

MIT
