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

AI assistants work best with small, well-scoped tasks, not sprawling layers or flat task lists. TracerKit structures every feature as **tracer-bullet vertical slices**: each phase cuts through every layer (schema → service → API → UI → tests) and is demoable on its own. Integration problems surface early, not at the end.

The workflow is three skills: **define** (`/tk:prd`), **plan** (`/tk:plan`), **verify** (`/tk:check`). Skills are pure Markdown with zero runtime deps. The AI reads your specs directly, counts progress, and archives completed work. No build step, no CLI at runtime.

## Get Started

### Install

```bash
npm install -g tracerkit
tracerkit init
```

Skills are installed to `~/.claude/skills/`, available in every project. Safe to re-run: adds missing skills without overwriting ones you've modified.

<details>
<summary>Per-project install (team members get skills via git)</summary>

```bash
tracerkit init .              # install to .claude/skills/ in current dir
tracerkit update .            # update project-scoped skills
tracerkit uninstall .         # remove project-scoped skills
```

</details>

<details>
<summary>Claude Code plugin (alternative)</summary>

Inside Claude Code, run:

```
/plugin install tk@claude-plugins-official
```

Run `/reload-plugins` if needed. Skills are available immediately, no build step, no config.

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
<summary>GitHub Issues as storage backend</summary>

Same skills, same workflow. Storage is configured per-project:

```bash
tracerkit config storage github         # set current project to use GitHub
tracerkit config github.repo org/repo   # set target repo
```

PRDs and plans become GitHub Issues with `tk:prd` and `tk:plan` labels. On `/tk:check` pass, issues are closed instead of archived locally. Each project can use a different backend -- local is the default. See [Configuration](docs/configuration.md) for details.

</details>

## Skills

TracerKit ships skills that take a feature from idea to verified archive.

### `/tk:prd <idea>`: Write a PRD

Interactive interview that explores your codebase, asks scoping questions one at a time, designs deep modules, and writes a structured PRD.

**Output:** `.tracerkit/prds/<slug>.md` (local) or GitHub Issue with `tk:prd` label

### `/tk:plan <slug>`: Create an implementation plan

Reads a PRD and breaks it into phased **tracer-bullet vertical slices**. Each phase is a thin but complete path through every layer (schema, service, API, UI, tests), demoable on its own.

**Output:** `.tracerkit/plans/<slug>.md` (local) or GitHub Issue with `tk:plan` label

### `/tk:brief`: Session briefing

Shows active features, their progress, and suggested focus. Use at the start of a session to orient.

**Output:** Feature dashboard in the terminal. No files written.

### `/tk:check [slug]`: Verify and archive

Verifies the codebase against the plan's done-when checkboxes. Runs tests, validates user stories, updates phase progress, and transitions the PRD status. On `done`, archives the PRD and plan to `.tracerkit/archives/<slug>/` automatically.

Without arguments, shows a feature dashboard with status and progress before asking which feature to check.

**Output:** Verdict block appended to the plan. On `done`: archives to `.tracerkit/archives/<slug>/` (local) or closes both issues (GitHub).

## Docs

| Document                                         | Description                                        |
| ------------------------------------------------ | -------------------------------------------------- |
| [Examples](docs/examples.md)                     | Walk through end-to-end usage scenarios            |
| [CLI Reference](docs/cli-reference.md)           | Commands: init, update, config, uninstall          |
| [Configuration](docs/configuration.md)           | Storage backends, GitHub options, custom paths     |
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
