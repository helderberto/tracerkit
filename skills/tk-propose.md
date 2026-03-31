# Instructions

You are running `/tk:propose`. Your job is to create a structured change directory under `.tracerkit/changes/` for a new idea.

## Input

The argument is: $ARGUMENTS

Convert the argument to a kebab-case slug (lowercase, spaces and underscores replaced with hyphens). This is `<slug>`.

## Steps

### 1. Check for existing artifacts

- If `.tracerkit/changes/<slug>/spec.md` already exists, stop and tell the user: "A change named `<slug>` already exists. Run `/tk:plan` to continue, or choose a different name."
- If a planning document or PRD for this idea exists in the project (e.g., `plans/`, `prds/`, or any file whose name contains the slug), note its path as `<planning-doc>`.

### 2. Gather context

**If `<planning-doc>` exists**: read it and skip the interview. Use its content to populate the artifacts directly.

**If no planning doc exists**: ask the user the following questions one at a time. Wait for each answer before asking the next.

1. What problem does this change solve? (1–3 sentences)
2. Who is affected and how do they experience the problem today?
3. What does success look like? Describe the expected behavior after the change.
4. What are the key acceptance criteria? (list at least 2 concrete, testable conditions)
5. Are there any constraints, risks, or things explicitly out of scope?

### 3. Write artifacts

Create the directory `.tracerkit/changes/<slug>/` and write three files.

**proposal.md**

```
# <slug>

## Problem
<problem statement from interview or planning doc>

## Context
<who is affected and current experience>

## Success
<expected behavior after the change>
```

**spec.md**

```
# Spec: <slug>

## Expected Behaviors

<numbered list of expected behaviors derived from acceptance criteria>

## Acceptance Criteria

<checkbox list of concrete, testable conditions>
- [ ] <criterion 1>
- [ ] <criterion 2>

## Out of Scope

<constraints and exclusions>
```

**tasks.md**

```
# Tasks: <slug>

> Status: draft — run `/tk:plan` to expand into a tracer-bullet checklist.

- [ ] (placeholder — `/tk:plan` will populate this)
```

### 4. Confirm

Tell the user:

- The slug used
- The three files created
- Next step: run `/tk:plan` to expand `tasks.md` into a tracer-bullet checklist
