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

|                         | No specs             | Standalone skills                  | OpenSpec                                   | TracerKit                                                                     |
| ----------------------- | -------------------- | ---------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| **Spec creation**       | Chat-only            | `/write-a-prd` generates a PRD     | `/opsx:propose` generates proposal + specs | `/tk:prd` — interactive interview + codebase exploration + deep module design |
| **Planning**            | Ad-hoc               | `/prd-to-plan` creates task list   | Design + tasks generated together          | `/tk:plan` — tracer-bullet vertical slices, each phase demoable end-to-end    |
| **Verification**        | Manual testing       | None built-in                      | Manual                                     | `/tk:verify` — automated read-only review with PASS/NEEDS_WORK verdicts       |
| **Archival**            | None                 | None                               | `/opsx:archive` folder move                | `/tk:archive` — verdict-gated (requires PASS to archive)                      |
| **Artifact connection** | None                 | PRD and plan are independent files | Linked via change folder                   | PRD -> Plan -> Verdict chain; plan references source PRD                      |
| **Iteration model**     | Rewrite from scratch | Re-run skill manually              | Fluid — edit any artifact                  | Verify/fix loop — re-run `/tk:verify` until PASS                              |
| **Tool support**        | Any                  | Claude Code                        | 20+ AI assistants                          | Claude Code plugin                                                            |

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
