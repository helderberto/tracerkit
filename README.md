<img src="./tracerkit.png?c=2" alt="TracerKit" width="100%" />

<br />

<div align="center">

[![CI](https://github.com/helderberto/tracerkit/actions/workflows/ci.yml/badge.svg)](https://github.com/helderberto/tracerkit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tracerkit)](https://www.npmjs.com/package/tracerkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Replace ad-hoc AI prompts with a repeatable three-step spec process: from idea to verified, archived code.

**Zero runtime dependencies.** Pure Markdown skills, no build step.

</div>

## Why TracerKit?

AI coding without specs means vague prompts and lost context between sessions. Most planning tools produce horizontal task lists. Nothing works until everything is done.

TracerKit uses **tracer-bullet vertical slices** instead: each phase cuts through every layer (schema → service → API → UI → tests), so every phase is demoable on its own. Integration problems surface early, context stays focused, and AI assistants get small, well-scoped phases instead of sprawling layers.

The term comes from [The Pragmatic Programmer](https://en.wikipedia.org/wiki/The_Pragmatic_Programmer). The name **TracerKit** = Tracer (bullet) + Kit — [read more about tracer bullets](https://www.aihero.dev/tracer-bullets).

## Get Started

### 1. Install TracerKit

```bash
npx tracerkit init
```

Skills are installed globally to `~/.claude/skills/`, available in every project. No per-project setup needed.

### 2. Use the workflow

```
You: /tk:prd add dark mode support
AI:  ✓ Written .tracerkit/prds/dark-mode-support.md

You: /tk:plan dark-mode-support
AI:  ✓ Phase 1 — CSS variables + ThemeProvider
     ✓ Phase 2 — Toggle component + localStorage
     ✓ Written .tracerkit/plans/dark-mode-support.md

You: /tk:verify dark-mode-support
AI:  ✓ All done-when conditions met
     ✅ PASS — archived to .tracerkit/archives/dark-mode-support/
```

See [Examples](docs/examples.md) for full walkthroughs.

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

#### `/tk:prd <idea>`: Write a PRD

Interactive interview to define a feature. Explores the codebase, asks scoping questions one at a time, designs deep modules, and writes a structured PRD.

**Output:** `.tracerkit/prds/<slug>.md`

#### `/tk:plan <slug>`: Create an implementation plan

Reads a PRD and breaks it into phased **tracer-bullet vertical slices**. Each phase is a thin but complete path through every layer (schema, service, API, UI, tests), demoable on its own.

**Output:** `.tracerkit/plans/<slug>.md`

#### `/tk:verify <slug>`: Verify and archive

Read-only review that compares the codebase against the plan's done-when conditions. Runs tests, checks user stories, and stamps a **✅ PASS** or **🚧 NEEDS_WORK** verdict. On ✅ PASS, automatically archives the PRD and plan to `.tracerkit/archives/<slug>/`.

**Output:** Verdict block in `.tracerkit/plans/<slug>.md`. On ✅ PASS: `.tracerkit/archives/<slug>/prd.md` + `.tracerkit/archives/<slug>/plan.md`

### Helper skills

Useful but optional. This category will grow over time.

#### `/tk:status`: Workflow dashboard

Scans `.tracerkit/prds/` and prints a table of all features grouped by status (`in_progress`, `created`, `done`), with age, latest verdict, and blocker/suggestion counts. Read-only. No files are modified.

## Docs

| Document                                         | Description                                         |
| ------------------------------------------------ | --------------------------------------------------- |
| [Examples](docs/examples.md)                     | End-to-end usage walkthroughs                       |
| [CLI Reference](docs/cli-reference.md)           | All CLI commands and flags                          |
| [Configuration](docs/configuration.md)           | Custom artifact paths via `config.json`             |
| [Metadata Lifecycle](docs/metadata-lifecycle.md) | YAML frontmatter states and transitions             |
| [Compared to](docs/compared-to.md)               | How TracerKit differs from Spec Kit, Kiro, OpenSpec |

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
