<img src="./tracerkit.png?c=2" alt="TracerKit" width="100%" />

<br />

<div align="center">

[![CI](https://github.com/helderberto/tracerkit/actions/workflows/ci.yml/badge.svg)](https://github.com/helderberto/tracerkit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tracerkit)](https://www.npmjs.com/package/tracerkit)
[![npm downloads](https://img.shields.io/npm/dm/tracerkit)](https://www.npmjs.com/package/tracerkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Replace ad-hoc AI prompts with a repeatable spec-driven workflow: from idea to verified spec.

Named after the tracer-bullet technique from _The Pragmatic Programmer_: **Tracer** + **Kit**.

**Markdown skills, zero runtime deps.** No build step, no project dependencies.

</div>

## Why TracerKit?

AI assistants work best with small, well-scoped tasks — not sprawling layers or flat task lists. TracerKit structures every feature as **tracer-bullet vertical slices**: each phase cuts through every layer (schema → service → API → UI → tests) and is demoable on its own. Integration problems surface early, not at the end.

Four skills drive the workflow: **define** (`/tk:prd`), **plan** (`/tk:plan`), **build** (`/tk:build`), **verify** (`/tk:check`). The AI reads your specs directly, counts progress, and marks completed work done. Pure Markdown, zero runtime deps.

```
DEFINE          PLAN           BUILD            VERIFY
/tk:prd  ───▶  /tk:plan  ───▶  /tk:build  ───▶  /tk:check
  │               │               │                 │
  ▼               ▼               ▼                 ▼
PRD doc       Phased plan    Implement phase    Pass/fail
                              + feedback loops
```

## Get Started

<details open>
<summary><b>Claude Code (recommended)</b></summary>

**Marketplace install:**

```
/plugin marketplace add helderberto/tracerkit
/plugin install tk@tracerkit-marketplace
```

**CLI install:**

```bash
npm install -g tracerkit
tracerkit init
```

Skills are installed to `~/.claude/skills/`, available in every project. Safe to re-run.

<details>
<summary>Per-project install (team members get skills via git)</summary>

```bash
tracerkit init .              # install to .claude/skills/ in current dir
tracerkit update .            # update project-scoped skills
tracerkit uninstall .         # remove project-scoped skills
```

</details>

</details>

<details>
<summary><b>Cursor</b></summary>

Copy skills into `.cursor/rules/`, or use Notepads for on-demand context. See [docs/cursor-setup.md](docs/cursor-setup.md).

</details>

<details>
<summary><b>Gemini CLI</b></summary>

Install as native skills for auto-discovery:

```bash
gemini skills install https://github.com/helderberto/tracerkit.git --path skills
```

Or add to `GEMINI.md` for persistent context. See [docs/gemini-cli-setup.md](docs/gemini-cli-setup.md).

</details>

<details>
<summary><b>GitHub Copilot</b></summary>

Copy skills to `.github/skills/` or add workflow rules to `.github/copilot-instructions.md`. See [docs/copilot-setup.md](docs/copilot-setup.md).

</details>

<details>
<summary><b>OpenCode</b></summary>

Uses agent-driven skill execution via `AGENTS.md`. See [docs/opencode-setup.md](docs/opencode-setup.md).

</details>

<details>
<summary><b>Other agents</b></summary>

Skills are plain Markdown with YAML frontmatter — they work with any agent that accepts instruction files. Clone the repo and point your agent at the `skills/` directory.

</details>

### Workflow

```
You: /tk:prd add dark mode support
AI:  Written .tracerkit/prds/dark-mode-support.md
     Run `/tk:plan dark-mode-support` next?

You: /tk:plan dark-mode-support
AI:  Phase 1 — Theme visible end-to-end
     Phase 2 — User can toggle and persist preference
     Written .tracerkit/plans/dark-mode-support.md
     Run `/tk:check dark-mode-support` when ready?

You: /tk:build dark-mode-support
AI:  Phase 1 — Theme visible end-to-end (3 remaining)
     Implementing... all checks pass. Commit?

You: /tk:check dark-mode-support
AI:  Total: 7/7
     All phases complete — implementation verified.
```

Between sessions, `/tk:brief` shows active features and picks up where you left off:

```
You: /tk:brief
AI:  dark-mode-support (3/7)
       Phase 1 — Theme visible end-to-end: 3/3
     > Phase 2 — User can toggle and persist preference: 0/4

     **Focus → dark-mode-support**
```

See [Examples](docs/examples.md) for full walkthroughs.

## Skills

| Skill              | What it does                                           | Output                               |
| ------------------ | ------------------------------------------------------ | ------------------------------------ |
| `/tk:prd <idea>`   | Interview → codebase scan → structured PRD             | `.tracerkit/prds/<slug>.md`          |
| `/tk:plan <slug>`  | PRD → phased vertical slices, each demoable on its own | `.tracerkit/plans/<slug>.md`         |
| `/tk:build <slug>` | Implement next incomplete phase, run feedback loops    | Code changes + checked items in plan |
| `/tk:brief`        | Feature dashboard with progress and suggested focus    | Terminal only, no files              |
| `/tk:check [slug]` | Verify done-when checkboxes against codebase and tests | Checkboxes updated in plan           |

## Docs

| Document                                     | Description                                       |
| -------------------------------------------- | ------------------------------------------------- |
| [Examples](docs/examples.md)                 | Walk through end-to-end usage scenarios           |
| [CLI Reference](docs/cli-reference.md)       | Commands: init, update, uninstall                 |
| [Comparison](docs/comparison.md)             | Compare TracerKit to Spec Kit, Kiro, and OpenSpec |
| [Cursor Setup](docs/cursor-setup.md)         | Use TracerKit skills in Cursor                    |
| [Gemini CLI Setup](docs/gemini-cli-setup.md) | Use TracerKit skills in Gemini CLI                |
| [Copilot Setup](docs/copilot-setup.md)       | Use TracerKit skills in GitHub Copilot            |
| [OpenCode Setup](docs/opencode-setup.md)     | Use TracerKit skills in OpenCode                  |

## Contributing

1. Fork the repo and create a feature branch
2. Use TracerKit itself to plan your change (`/tk:prd` + `/tk:plan`)
3. Implement following the plan phases
4. `npm run lint:fix && npm run test:run && npm run typecheck`
5. [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint)
6. Open a PR against `main`

## Support

For support, please [open a GitHub issue](https://github.com/helderberto/tracerkit/issues). We welcome bug reports, feature requests, and questions.

## Acknowledgments

This project was born out of [Claude Code for Real Engineers](https://www.aihero.dev/cohorts/claude-code-for-real-engineers-2026-04), a cohort by [Matt Pocock](https://github.com/mattpocock). The hands-on approach to building real things with Claude Code sparked the idea for TracerKit. If you're serious about AI-assisted engineering, I can't recommend Matt's cohorts and content highly enough.

## License

[MIT License](LICENSE) © [helderberto](https://helderberto.com)
