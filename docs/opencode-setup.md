# Using TracerKit with OpenCode

OpenCode doesn't have a native plugin system, but TracerKit skills work via `AGENTS.md` and the `skill` tool.

## Setup

1. Clone TracerKit into your project:

```bash
git clone https://github.com/helderberto/tracerkit.git
```

2. Copy skills to your project:

```bash
cp -r tracerkit/skills/ .agents/skills/
```

3. Add skill routing to your `AGENTS.md`:

```markdown
# Workflow Skills

When the user asks to define, plan, or verify a feature, use the matching skill:

| Intent                                 | Skill                   |
| -------------------------------------- | ----------------------- |
| Define a feature, write a PRD          | `skills/prd/SKILL.md`   |
| Plan implementation phases             | `skills/plan/SKILL.md`  |
| Verify implementation, check progress  | `skills/check/SKILL.md` |
| Session briefing, show active features | `skills/brief/SKILL.md` |

Always check if a skill applies before acting. If a skill applies, follow it exactly.
```

## How It Works

The agent evaluates each request and maps it to the appropriate skill:

- "Create a PRD for auth" → reads and follows `skills/prd/SKILL.md`
- "Plan the auth feature" → reads and follows `skills/plan/SKILL.md`
- "Check if auth is done" → reads and follows `skills/check/SKILL.md`
- "What's in progress?" → reads and follows `skills/brief/SKILL.md`

No slash commands needed — natural language triggers the right skill.

## Usage Examples

```
Create a PRD for: add dark mode support
```

```
Plan the dark-mode-support feature using vertical slices
```

```
Verify dark-mode-support — check all done-when criteria
```

## Limitations

- No native slash commands (handled via intent mapping in AGENTS.md)
- No plugin system (handled via prompt + skill files)
- Skill invocation depends on model compliance

## Tips

- **AGENTS.md is key** — it tells the agent when and how to use skills.
- **Artifacts work the same** — PRDs go to `.tracerkit/prds/`, plans to `.tracerkit/plans/`.
- **Keep skills in the repo** — team members get them via git.
