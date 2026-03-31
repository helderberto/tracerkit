# TracerKit

A spec-driven workflow plugin for Claude Code. Guides AI-assisted development through a structured loop: define, plan, build, verify, archive.

**Zero runtime dependencies** — pure Markdown skills, no build step.

## Why TracerKit?

AI coding assistants are powerful but unpredictable when requirements live only in chat history. Without shared artifacts, sessions drift, scope creeps, and context gets lost between conversations.

TracerKit brings **predictability without ceremony** — a lightweight specification layer that ensures human and AI align on requirements _before_ implementation begins.

### The problem with unstructured AI coding

- Requirements live in ephemeral chat messages
- No way to verify "done" against a shared spec
- Context resets between sessions; previous decisions are lost
- Scope creeps because nothing defines boundaries

### How existing approaches compare

|                           | [Spec Kit](https://github.com/github/spec-kit)    | [Kiro](https://kiro.dev/)               | [OpenSpec](https://github.com/Fission-AI/OpenSpec) | TracerKit                                                      |
| ------------------------- | ------------------------------------------------- | --------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| **What it is**            | CLI toolkit + extensions ecosystem                | Agentic IDE (VS Code fork)              | Slash-command framework                            | Claude Code plugin (pure Markdown)                             |
| **Setup**                 | Python (`uv tool install`)                        | Dedicated IDE install                   | Copy slash commands                                | Copy 2 directories                                             |
| **Phases**                | 5 (constitution, specify, plan, tasks, implement) | 3 (requirements, design, tasks)         | 3 (propose, apply, archive)                        | 4 (prd, plan, verify, archive)                                 |
| **Artifacts per feature** | 4 files (constitution, spec, plan, tasks)         | EARS requirements + design + tasks      | proposal + specs + design + tasks                  | 2 files (PRD, plan)                                            |
| **Planning model**        | Task lists with completion tracking               | Sequenced tasks with dependency mapping | Task lists in change folder                        | Tracer-bullet vertical slices — each phase demoable end-to-end |
| **Verification**          | Human-in-the-loop at phase gates                  | Diff approval workflow                  | Manual                                             | Built-in `/tk:verify` with PASS/NEEDS_WORK verdicts            |
| **Archival**              | Not built-in                                      | Not built-in                            | Folder move                                        | Verdict-gated — requires PASS to archive                       |
| **Tool lock-in**          | Any AI assistant (20+)                            | Kiro IDE only (Claude models)           | Any AI assistant (20+)                             | Claude Code only                                               |
| **Runtime deps**          | Python + uv                                       | Proprietary IDE                         | None                                               | None                                                           |
| **Extensions/plugins**    | 40+ community extensions                          | Agent hooks, MCP integration            | None                                               | None (yet)                                                     |
| **Complexity**            | High — full methodology                           | High — full IDE                         | Low                                                | Low                                                            |

### Where TracerKit fits

**Spec Kit** is a full methodology with a CLI, extensions ecosystem, and 5-phase workflow. It's thorough but heavyweight — you need Python, `uv`, and buy into a structured process with constitution files and phase gates.

**Kiro** is the most integrated option — a dedicated IDE with built-in specs, agent hooks, and autonomous execution. The tradeoff is vendor lock-in: you must use their IDE and their supported models.

**OpenSpec** is the closest in philosophy — lightweight, slash-command based, fluid iteration. It targets breadth (20+ AI assistants) over depth.

**TracerKit** chooses depth over breadth. By targeting Claude Code exclusively, it can leverage native plugin discovery, subagents for read-only verification, and the skill system directly. The tradeoff is clear: it only works with Claude Code, but within that context it provides the simplest setup (copy 2 dirs), fewest artifacts (2 files per feature), and the only built-in automated verification step.

### What TracerKit adds over standalone `/write-a-prd` + `/prd-to-plan`

Using the standalone skills (`/write-a-prd` and `/prd-to-plan`) gives you spec creation and planning, but they operate as disconnected one-shots:

1. **No feedback loop** — once the plan is written, there's no way to verify implementation against it
2. **No artifact chain** — the PRD and plan are independent files with no formal link
3. **No archival gate** — completed work isn't systematically closed; old specs accumulate
4. **No verdict history** — you can't look back and see when something was verified or what blockers were found

TracerKit wraps the full lifecycle: define -> plan -> build -> verify -> archive, with each step referencing the previous artifact and a built-in quality gate before closure.

### Principles

Inspired by [OpenSpec](https://github.com/Fission-AI/OpenSpec)'s philosophy:

- **Agreement before code** — specs establish shared expectations; implementation follows
- **Fluid, not rigid** — any artifact can be refined at any point; no strict phase gates
- **Built for brownfield** — designed for existing codebases, not just greenfield projects
- **Easy, not complex** — minimal overhead; pure Markdown, zero config
- **Iterative, not waterfall** — continuous refinement through verify/fix cycles

## Development Flow

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
                       |  Read-only review   |
                       +----------+----------+
                                  |
                         +--------+--------+
                         |                 |
                    NEEDS_WORK           PASS
                         |                 |
                         v                 v
                  Fix blockers    /tk:archive <slug>
                  then re-run     Move to archive/
                  /tk:verify
```

## Installation

Copy (or symlink) the `.claude-plugin/` and `skills/` directories into your project root. Claude Code discovers the plugin automatically via `.claude-plugin/plugin.json`.

## Skills

### `/tk:prd <idea>` — Write a PRD

Starts an interactive interview to define a feature. Explores the codebase, asks scoping questions one at a time, designs deep modules, and writes a structured PRD.

**Output:** `prds/<slug>.md`

### `/tk:plan <slug>` — Create an implementation plan

Reads a PRD and breaks it into phased **tracer-bullet vertical slices** — each phase is a thin but complete path through every layer (schema, service, API, UI, tests), demoable on its own.

**Output:** `plans/<slug>.md`

### `/tk:verify <slug>` — Verify implementation

Launches a read-only review that compares the current codebase against the plan's done-when conditions. Runs tests, checks user stories, and stamps the plan with a **PASS** or **NEEDS_WORK** verdict.

**Output:** Verdict block appended to `plans/<slug>.md`

### `/tk:archive <slug>` — Archive completed work

Moves a PASS-verified PRD and plan to `archive/<slug>/` with a closing timestamp. Refuses to archive without a passing verdict.

**Output:** `archive/<slug>/prd.md` + `archive/<slug>/plan.md`

## Project Structure

```
.claude-plugin/
  plugin.json          # Plugin manifest (name: "tk")
skills/
  prd/SKILL.md         # PRD writing skill
  plan/SKILL.md        # Plan generation skill
  verify/SKILL.md      # Verification skill
  archive/SKILL.md     # Archival skill
prds/                  # Active PRDs (created by /tk:prd)
plans/                 # Active plans (created by /tk:plan)
archive/               # Completed work (created by /tk:archive)
```

## Scripts

```bash
npm run build          # Compile TypeScript
npm run dev            # Watch mode
npm run test           # Run tests (vitest watch)
npm run test:run       # Run tests once
npm run lint           # Lint src/
npm run lint:fix       # Lint + auto-fix
npm run format         # Format with Prettier
npm run format:check   # Check formatting
npm run typecheck      # Type-check without emitting
```

## Contributing

1. Fork the repo and create a feature branch
2. Use TracerKit itself to plan your change (`/tk:prd` + `/tk:plan`)
3. Implement following the plan phases
4. Run `npm run lint:fix && npm run test:run && npm run typecheck` before committing
5. Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint)
6. Open a PR against `main`

## Author

**Helder Burato Berto** — [github.com/helderberto](https://github.com/helderberto)

## License

MIT
