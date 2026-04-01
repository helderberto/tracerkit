<img src="./tracerkit.png?c=2" alt="TracerKit" width="100%" />

<br />

<div align="center">

[![CI](https://github.com/helderberto/tracerkit/actions/workflows/ci.yml/badge.svg)](https://github.com/helderberto/tracerkit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tracerkit)](https://www.npmjs.com/package/tracerkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Replace ad-hoc AI prompts with a repeatable three-step spec process: from idea to verified, archived code.

Named after the tracer-bullet technique from _The Pragmatic Programmer_ — **Tracer** + **Kit**.

**Zero runtime dependencies.** Pure Markdown skills, no build step.

</div>

## Why TracerKit?

Without specs, every AI session starts from scratch — vague prompts, duplicated context, no way to confirm "done." Most planning tools produce flat task lists where nothing works until everything is done.

TracerKit takes a different approach: **tracer-bullet vertical slices**. Each phase cuts through every layer (schema → service → API → UI → tests), so every phase is demoable on its own. Integration problems surface early, context stays focused, and AI assistants get small, well-scoped phases instead of sprawling layers.

## Get Started

### Install

```bash
npx tracerkit init
```

Skills are installed globally to `~/.claude/skills/`, available in every project. No per-project setup needed.

### Workflow

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

TracerKit ships four skills — three for the core workflow, one for visibility.

### Core skills

Three steps that take a feature from idea to verified archive.

#### `/tk:prd <idea>`: Write a PRD

Interactive interview that explores your codebase, asks scoping questions one at a time, designs deep modules, and writes a structured PRD.

**Output:** `.tracerkit/prds/<slug>.md`

#### `/tk:plan <slug>`: Create an implementation plan

Reads a PRD and breaks it into phased **tracer-bullet vertical slices**. Each phase is a thin but complete path through every layer (schema, service, API, UI, tests), demoable on its own.

**Output:** `.tracerkit/plans/<slug>.md`

#### `/tk:verify <slug>`: Verify and archive

Read-only review that checks the codebase against the plan's done-when conditions. Runs tests, validates user stories, and stamps a **✅ PASS** or **🚧 NEEDS_WORK** verdict. On ✅ PASS, archives the PRD and plan to `.tracerkit/archives/<slug>/` automatically.

**Output:** Verdict block in `.tracerkit/plans/<slug>.md`. On ✅ PASS: `.tracerkit/archives/<slug>/prd.md` + `.tracerkit/archives/<slug>/plan.md`

### Helper skills

Useful but optional.

#### `/tk:status`: Workflow dashboard

Scans `.tracerkit/prds/` and prints a table of all features grouped by status (`in_progress`, `created`, `done`), with age, latest verdict, and blocker/suggestion counts. Read-only. No files are modified.

## Docs

| Document                                         | Description                                        |
| ------------------------------------------------ | -------------------------------------------------- |
| [Examples](docs/examples.md)                     | Walk through end-to-end usage scenarios            |
| [CLI Reference](docs/cli-reference.md)           | Browse all CLI commands and flags                  |
| [Configuration](docs/configuration.md)           | Configure custom artifact paths via `config.json`  |
| [Metadata Lifecycle](docs/metadata-lifecycle.md) | Understand YAML frontmatter states and transitions |
| [Compared to](docs/compared-to.md)               | Compare TracerKit to Spec Kit, Kiro, and OpenSpec  |

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
