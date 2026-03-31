# tracerkit — Planning

npm: `tracerkit` (available)
repo: `tracerkit`

## Vision

Stack-agnostic spec-driven workflow library for AI coding assistants.
Closes the loop: propose → plan → implement (TDD) → verify → archive.

## Differentiators vs. OpenSpec

- TDD-first: spec generates failing tests before implementation
- Tracer bullets: vertical slices baked into `/plan` output
- Specialized agents: debugger, test-auditor, code-reviewer routed per task
- Opinionated methodology, stack-agnostic tooling

## Core Loop

```
/tk:propose <idea>   → creates .tracerkit/changes/<name>/
/tk:plan             → tracer bullet phases from spec
/tdd                 → red → green → refactor per task
/tk:verify           → subagent checks impl vs spec
/ship                → atomic commits + push
/tk:archive          → moves change to .tracerkit/archive/
```

## Artifacts per change

```
.tracerkit/changes/<name>/
  proposal.md    — problem, context, why
  spec.md        — expected behaviors (input for TDD)
  tasks.md       — tracer bullet checklist
```

## Repository Structure

```
tracerkit/
  bin/
    cli.js              → init, update, config
  skills/
    propose.md          → /tk:propose
    plan.md             → /tk:plan
    verify.md           → /tk:verify
    archive.md          → /tk:archive
  agents/               → debugger, test-auditor, code-reviewer, etc.
  docs/                 → code-principles, testing, git, a11y
  templates/
    CLAUDE.md.hbs       → base template (stack detection later)
  src/                  → CLI source (TypeScript)
  test/
  package.json
  tsconfig.json
  README.md
```

## CLI Commands

```bash
tracerkit init      # inject .claude/ + .tracerkit/ into project
tracerkit update    # refresh skills/agents without overwriting customizations
tracerkit config    # profile selection (minimal / full)
```

## Slash Commands

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `/tk:propose <idea>` | Create change artifacts               |
| `/tk:plan`           | Generate tracer bullet plan from spec |
| `/tk:verify`         | Verify implementation against spec    |
| `/tk:archive`        | Archive completed change              |

## MVP Scope

1. CLI: `init` + `update`
2. Skills: `propose`, `plan`, `verify`, `archive`
3. Agents: debugger, test-auditor, code-reviewer (port from dotfiles)
4. Docs: code-principles, testing, git (port from dotfiles)
5. Base CLAUDE.md template

## Post-MVP

- Stack detection on `init` (TS, Python, Go...)
- Agent auto-routing: `/plan` assigns agent per task type
- Spec-to-test generation: failing tests as part of `/propose` output
- Explicit `/tk:review` gate before `/tk:apply`
- Multi-agent parallelism via worktrees
- Git linkage: archive records closing commit hash
- Spec drift metrics: spec vs. final implementation diff

## Open Questions

- Skills format: stay with SKILL.md frontmatter or adopt OpenSpec's approach?
- Agent injection: copy files or symlink from npm package?
- CLAUDE.md conflict resolution: merge strategy when user has existing file
- Versioning: how to handle skill updates in projects that customized them?
