# Using TracerKit with Gemini CLI

TracerKit skills are plain Markdown with YAML frontmatter — compatible with Gemini CLI's native skill system.

## Setup

### Option 1: Install as Skills (Recommended)

Gemini CLI auto-discovers `SKILL.md` files in `.gemini/skills/` or `.agents/skills/`.

**From the repo:**

```bash
gemini skills install https://github.com/helderberto/tracerkit.git --path skills
```

**From a local clone:**

```bash
git clone https://github.com/helderberto/tracerkit.git
gemini skills install ./tracerkit/skills/
```

**Workspace-scoped:**

```bash
gemini skills install ./tracerkit/skills/ --scope workspace
```

Verify installation:

```
/skills list
```

Gemini CLI injects skill names and descriptions into the prompt automatically. When it recognizes a matching task, it activates the skill.

### Option 2: GEMINI.md (Persistent Context)

For always-loaded context, add skills to your project's `GEMINI.md`:

```markdown
# Project Instructions

@skills/prd/SKILL.md
@skills/plan/SKILL.md
@skills/check/SKILL.md
@skills/brief/SKILL.md
```

Use `/memory show` to verify loaded context and `/memory reload` to refresh after changes.

> **Skills vs GEMINI.md:** Skills activate on demand, keeping context clean. GEMINI.md is persistent. Use skills for the workflow phases, GEMINI.md for always-on conventions.

## Usage

Skills activate automatically based on intent:

- "Create a PRD for dark mode" → `tk:prd`
- "Plan the dark-mode-support feature" → `tk:plan`
- "Check if dark-mode-support is done" → `tk:check`
- "Show me active features" → `tk:brief`

Or reference explicitly:

```
Use the @skills/prd/SKILL.md skill to create a PRD for: add dark mode support
```

## Tips

- **Prefer skills over GEMINI.md** — on-demand activation keeps the context window focused.
- **Artifacts work the same** — PRDs go to `.tracerkit/prds/`, plans to `.tracerkit/plans/`.
- **Skill descriptions drive discovery** — each SKILL.md frontmatter describes when to activate.
