# Post Ideas: Building TracerKit

Learnings from building a spec-driven workflow CLI for AI coding assistants.

## 1. Dogfooding your own tool is the best test

We used TracerKit's own `/tk:prd` and `/tk:plan` skills to plan TracerKit features. The configuration-file feature was specced, planned, and verified using the same 3-step workflow the tool provides. Every friction point we hit became a feature improvement.

## 2. Skills are just Markdown — and that's a superpower

No build step, no runtime, no dependencies. Claude Code skills are plain Markdown files with YAML frontmatter. This means:

- Version control works perfectly (diff-friendly)
- Users can read and edit skills without learning a framework
- Template placeholders (`{{paths.prds}}`) are trivial to implement — just string replacement

## 3. Tracer-bullet vertical slices beat horizontal layers

Instead of "build all the backend, then all the frontend," each phase cuts through every layer (config module → template rendering → CLI wiring → tests). Every phase is demoable. Integration bugs surface in Phase 1, not at the end.

## 4. The interview-driven PRD process catches scope creep early

The `/tk:prd` interview walks through explicit branches: scope, data, behavior, boundaries. The "Boundaries" branch forces you to write what's explicitly out of scope. For the config feature, we deferred migration commands and runtime config reading — decisions that would have doubled the work.

## 5. Bake-at-init beats runtime resolution

The design choice to substitute config values into skill templates at `init`/`update` time (instead of reading config at runtime) kept the skills simple. Skills remain pure Markdown with no dynamic config loading. The CLI is the only place that reads `.tracerkit/config.json`.

## 6. TDD with AI is surprisingly natural

The red-green-refactor loop works well with AI assistants:

- **Red**: write failing tests that describe the behavior
- **Green**: implement the minimum code to pass
- **Refactor**: clean up with confidence

The test suite acts as a safety net for the AI — it can make changes boldly knowing tests will catch regressions.

## 7. Default paths matter more than you think

Moving from root-level `prds/`, `plans/`, `archive/` to `.tracerkit/prds/`, `.tracerkit/plans/`, `.tracerkit/archives/` was a small change with big impact. The project root stays clean, and the dotfile convention (like `.git/`, `.claude/`) immediately signals "tool-managed directory."

## 8. Zero-dep tools are easier to maintain and trust

TracerKit has zero runtime dependencies. The CLI is ~200 lines of Node.js using only built-in modules (`fs`, `path`, `crypto`). No bundler config, no dependency updates, no supply chain concerns. The entire tool is auditable in minutes.

## 9. Three-step workflows reduce cognitive overhead

PRD → Plan → Verify. Three steps, three commands, three artifacts. Users don't need to learn a complex lifecycle. The verify step auto-archives on PASS, so completed features move out of the way automatically.

## 10. Config should be optional, not required

`.tracerkit/config.json` is entirely optional. Missing file = all defaults. Partial config = merge with defaults. This means new users get a working setup with zero configuration, and power users can customize without reading docs first.
