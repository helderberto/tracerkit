# TracerKit

A spec-driven workflow plugin for Claude Code. Three commands take a feature from idea to verified archive: define, plan, verify.

**Zero runtime dependencies** — pure Markdown skills, no build step.

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

### Examples

<details>
<summary>New feature from scratch</summary>

```bash
# 1. Define the feature — interactive interview, explores your codebase
/tk:prd add dark mode support

# 2. Break the PRD into phased vertical slices
/tk:plan dark-mode-support

# 3. Implement each phase from the plan
#    (work through phases with Claude)

# 4. Verify — auto-archives on PASS
/tk:verify dark-mode-support
```

</details>

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
<summary>Bug fix with lightweight spec</summary>

```bash
# Even small fixes benefit from a quick PRD to capture root cause
/tk:prd fix: login form submits twice on slow networks

# Plan is usually a single phase for bug fixes
/tk:plan fix-login-double-submit

# Fix, verify (auto-archives on PASS)
/tk:verify fix-login-double-submit
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

## Installation

### From the official marketplace (recommended)

```shell
/plugin install tk@claude-plugins-official
```

Then run `/reload-plugins` to activate. Skills are available as `/tk:prd`, `/tk:plan`, and `/tk:verify`.

### Manual (for development)

Clone the repo and load it directly:

```bash
git clone https://github.com/helderberto/tracerkit.git
claude --plugin-dir ./tracerkit
```

Or symlink into an existing project:

```bash
ln -s /path/to/tracerkit/.claude-plugin .claude-plugin
ln -s /path/to/tracerkit/skills skills
```

Claude Code discovers the plugin automatically via `.claude-plugin/plugin.json`.

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

AI coding assistants are powerful but unpredictable when requirements live only in chat history. Without shared artifacts, sessions drift, scope creeps, and context gets lost between conversations.

TracerKit brings **predictability without ceremony** — a lightweight specification layer that ensures human and AI align on requirements _before_ implementation begins.

### The problem with unstructured AI coding

- Requirements live in ephemeral chat messages
- No way to verify "done" against a shared spec
- Context resets between sessions; previous decisions are lost
- Scope creeps because nothing defines boundaries

### How existing approaches compare

|                  | [Spec Kit](https://github.com/github/spec-kit) | [Kiro](https://kiro.dev/)  | [OpenSpec](https://github.com/Fission-AI/OpenSpec) | TracerKit                          |
| ---------------- | ---------------------------------------------- | -------------------------- | -------------------------------------------------- | ---------------------------------- |
| **What it is**   | CLI toolkit + extensions                       | Agentic IDE (VS Code fork) | Slash-command framework                            | Claude Code plugin (pure Markdown) |
| **Setup**        | Python + uv                                    | Dedicated IDE              | Copy slash commands                                | `/plugin install`                  |
| **Phases**       | 5                                              | 3                          | 3                                                  | 3 (prd, plan, verify)              |
| **Artifacts**    | 4 files                                        | 3+ files                   | 4+ files                                           | 2 files (PRD, plan)                |
| **Verification** | Manual phase gates                             | Diff approval              | Manual                                             | Automated PASS/NEEDS_WORK          |
| **Tool lock-in** | Any AI assistant                               | Kiro IDE only              | Any AI assistant                                   | Claude Code only                   |
| **Runtime deps** | Python + uv                                    | Proprietary IDE            | None                                               | None                               |
| **Complexity**   | High                                           | High                       | Low                                                | Low                                |

### Where TracerKit fits

**Spec Kit** is a full methodology with a CLI, extensions ecosystem, and 5-phase workflow. Thorough but heavyweight — requires Python, `uv`, and a structured process with constitution files and phase gates.

**Kiro** is the most integrated option — a dedicated IDE with built-in specs, agent hooks, and autonomous execution. The tradeoff is vendor lock-in: their IDE, their supported models.

**OpenSpec** is the closest in philosophy — lightweight, slash-command based, fluid iteration. It targets breadth (20+ AI assistants) over depth.

**TracerKit** chooses depth over breadth. By targeting Claude Code exclusively, it leverages native plugin discovery, subagents for read-only verification, and the skill system directly. The tradeoff: it only works with Claude Code. Within that context it provides the simplest setup (copy 2 dirs), fewest artifacts (2 files per feature), and the only built-in automated verification step.

### Principles

Inspired by [OpenSpec](https://github.com/Fission-AI/OpenSpec)'s philosophy:

- **Agreement before code** — specs establish shared expectations; implementation follows
- **Fluid, not rigid** — any artifact can be refined at any point; no strict phase gates
- **Built for brownfield** — designed for existing codebases, not just greenfield projects
- **Easy, not complex** — minimal overhead; pure Markdown, zero config
- **Iterative, not waterfall** — continuous refinement through verify/fix cycles

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
