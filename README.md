<img src="./tracerkit.png?c=2" alt="TracerKit" width="100%" />

<br />

<div align="center">

[![CI](https://github.com/helderberto/tracerkit/actions/workflows/ci.yml/badge.svg)](https://github.com/helderberto/tracerkit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tracerkit)](https://www.npmjs.com/package/tracerkit)
[![npm downloads](https://img.shields.io/npm/dm/tracerkit)](https://www.npmjs.com/package/tracerkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Replace ad-hoc AI prompts with a repeatable spec-driven workflow: from idea to verified, archived spec.

Named after the tracer-bullet technique from _The Pragmatic Programmer_: **Tracer** + **Kit**.

**Markdown skills, zero runtime deps.** No build step, no project dependencies.

</div>

## Why TracerKit?

Without specs, every AI session starts from scratch. Vague prompts, duplicated context, no way to confirm "done." Most planning tools produce flat task lists where nothing works until everything is done.

TracerKit takes a different approach: **tracer-bullet vertical slices**. Each phase cuts through every layer (schema → service → API → UI → tests), so every phase is demoable on its own. Integration problems surface early, context stays focused, and AI assistants get small, well-scoped phases instead of sprawling layers.

**Zero runtime deps, intelligent skills.** Skills are pure Markdown with inline algorithms — no CLI calls at runtime. The AI reads your PRDs and plans directly, counts checkboxes, builds dashboards, and archives completed features. The CLI only manages installation (`init`, `update`, `uninstall`). AI adds the judgment: interviewing you for scope, designing modules, verifying implementation against specs.

## Get Started

### Install

```bash
npm install -g tracerkit
tracerkit init
```

Skills are installed to `~/.claude/skills/`, available in every project. Safe to re-run — adds missing skills without overwriting ones you've modified.

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

You: # open the plan, implement each phase, write tests...

You: /tk:check dark-mode-support
AI:  Status: done | Total: 5/5
     Archived to .tracerkit/archives/dark-mode-support/
```

Use `/tk:brief` at the start of any session to see active features and pick up where you left off:

```
You: /tk:brief
AI:  | Feature           | Status      | Age | Progress | Next                         |
     |-------------------|-------------|-----|----------|------------------------------|
     | dark-mode-support | in_progress | 3d  | 3/7      | Toggle component renders ... |

     **Focus → dark-mode-support**
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

TracerKit ships skills that take a feature from idea to verified archive.

### `/tk:prd <idea>`: Write a PRD

Interactive interview that explores your codebase, asks scoping questions one at a time, designs deep modules, and writes a structured PRD.

**Output:** `.tracerkit/prds/<slug>.md`

### `/tk:plan <slug>`: Create an implementation plan

Reads a PRD and breaks it into phased **tracer-bullet vertical slices**. Each phase is a thin but complete path through every layer (schema, service, API, UI, tests), demoable on its own.

**Output:** `.tracerkit/plans/<slug>.md`

### `/tk:brief`: Session briefing

Shows active features, their progress, and suggested focus. Use at the start of a session to orient.

**Output:** Feature dashboard in the terminal — no files written.

### `/tk:check [slug]`: Verify and archive

Verifies the codebase against the plan's done-when checkboxes. Runs tests, validates user stories, updates phase progress, and transitions the PRD status. On `done`, archives the PRD and plan to `.tracerkit/archives/<slug>/` automatically.

Without arguments, shows a feature dashboard with status and progress before asking which feature to check.

**Output:** Verdict block in `.tracerkit/plans/<slug>.md`. On `done`: `.tracerkit/archives/<slug>/prd.md` + `.tracerkit/archives/<slug>/plan.md`

## Docs

| Document                                         | Description                                        |
| ------------------------------------------------ | -------------------------------------------------- |
| [Examples](docs/examples.md)                     | Walk through end-to-end usage scenarios            |
| [CLI Reference](docs/cli-reference.md)           | Lifecycle commands: init, update, uninstall        |
| [Configuration](docs/configuration.md)           | Configure custom artifact paths via `config.json`  |
| [Metadata Lifecycle](docs/metadata-lifecycle.md) | Understand YAML frontmatter states and transitions |
| [Comparison](docs/comparison.md)                 | Compare TracerKit to Spec Kit, Kiro, and OpenSpec  |

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
