---
description: Session briefing — shows active features, progress, and suggested focus. Use at the start of a session to orient.
---

# Session Briefing

Get a quick overview of all active features, their progress, and what to focus on next.

## Pre-loaded context

- Briefing: !`tracerkit brief 2>&1`

## Workflow

### 1. Present the briefing

Display the output above as-is. Features with `status: done` are excluded (already archived).

### 3. Focus recommendation

The **Focus** line at the bottom suggests which feature to work on:

- If exactly 1 feature is `in_progress`, it's auto-selected
- Otherwise, the oldest feature by `created` date is selected

### 4. Offer next steps

Ask the user what they'd like to do:

- Continue the focused feature (read its plan at `{{paths.plans}}/<slug>.md`)
- Start a new feature with `/tk:prd`
- Check progress on a feature with `/tk:check <slug>`
