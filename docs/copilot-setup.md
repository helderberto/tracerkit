# Using TracerKit with GitHub Copilot

TracerKit skills are plain Markdown — they work with Copilot via skills directories or custom instructions.

## Setup

### Option 1: Skills Directory (Recommended)

Copilot supports skill directories in `.github/skills/`, `.claude/skills/`, or `.agents/skills/`.

```bash
# Clone TracerKit
git clone https://github.com/helderberto/tracerkit.git

# Copy skills to your project
mkdir -p .github/skills
cp -r tracerkit/skills/prd .github/skills/tk-prd
cp -r tracerkit/skills/plan .github/skills/tk-plan
cp -r tracerkit/skills/check .github/skills/tk-check
cp -r tracerkit/skills/brief .github/skills/tk-brief
```

Each skill directory contains a `SKILL.md` with frontmatter that Copilot uses for discovery.

### Option 2: Custom Instructions

Add workflow rules to `.github/copilot-instructions.md`:

```markdown
# TracerKit Workflow

## Feature Development

- Always start with a PRD before writing code
- Break PRDs into phased vertical slices (tracer-bullet approach)
- Each phase cuts through every layer and is demoable on its own
- Verify implementation against done-when checkboxes before marking complete

## Artifacts

- PRDs: `.tracerkit/prds/<slug>.md`
- Plans: `.tracerkit/plans/<slug>.md`
- Status lifecycle: created → in_progress → done

## Rules

- Never skip the PRD step for non-trivial features
- Each plan phase must have done-when checkboxes
- Verify against codebase and tests, not assumptions
```

## Usage

In Copilot Chat, reference skills explicitly:

```
Use the tk-prd skill to create a PRD for: add dark mode support
```

```
Use the tk-plan skill to plan: dark-mode-support
```

```
Use the tk-check skill to verify: dark-mode-support
```

## Tips

- **Keep instructions concise** — Copilot works best with focused rules. Use the skills directory for full skill files, custom instructions for summaries.
- **Artifacts work the same** — PRDs go to `.tracerkit/prds/`, plans to `.tracerkit/plans/`.
- **Commit skills to the repo** — team members get them automatically.
