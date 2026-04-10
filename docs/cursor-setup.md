# Using TracerKit with Cursor

TracerKit skills are plain Markdown — they work in Cursor via rules or notepads.

## Setup

### Option 1: Rules Directory (Recommended)

```bash
# Clone TracerKit
git clone https://github.com/helderberto/tracerkit.git

# Copy skills as Cursor rules
mkdir -p .cursor/rules
cp tracerkit/skills/prd/SKILL.md .cursor/rules/tk-prd.md
cp tracerkit/skills/plan/SKILL.md .cursor/rules/tk-plan.md
cp tracerkit/skills/check/SKILL.md .cursor/rules/tk-check.md
cp tracerkit/skills/brief/SKILL.md .cursor/rules/tk-brief.md
```

Rules in `.cursor/rules/` are automatically loaded into Cursor's context.

### Option 2: Notepads

Store skills as reusable context via Cursor's Notepads:

1. Open Cursor Settings > Notepads
2. Create a notepad per skill (e.g. "tk: PRD")
3. Paste the content of the corresponding `SKILL.md`
4. Reference in chat with `@notepad tk: PRD`

## Usage

Cursor doesn't support slash commands natively. Instead, reference skills explicitly:

```
Follow the tk-prd rules to create a PRD for: add dark mode support
```

```
Follow the tk-plan rules to plan the feature: dark-mode-support
```

```
Follow the tk-check rules to verify: dark-mode-support
```

## Tips

- **Load only what you need** — Cursor has context limits. Load 1-2 skills as rules, keep others as notepads.
- **Reference explicitly** — Tell Cursor which skill to follow so it reads the loaded rules.
- **Artifacts work the same** — PRDs go to `.tracerkit/prds/`, plans to `.tracerkit/plans/`.
