# Instructions

You are running `/tk:plan`. Your job is to read the spec for the active change and rewrite `tasks.md` as a tracer-bullet checklist.

## Input

The argument (if provided) is: $ARGUMENTS

Use the argument as `<slug>` if given. If no argument is provided, look inside `.tracerkit/changes/` and list the available changes; if there is exactly one, use it. If there are multiple, ask the user which one to plan.

## Steps

### 1. Read the spec

Read `.tracerkit/changes/<slug>/spec.md`. If it does not exist, stop and tell the user: "No spec found for `<slug>`. Run `/tk:propose <slug>` first."

### 2. Understand the scope

From `spec.md` identify:

- The expected behaviors
- The acceptance criteria
- Any out-of-scope constraints

### 3. Design tracer-bullet slices

Break the work into vertical slices. Each slice should be end-to-end testable: it touches all layers needed to satisfy one acceptance criterion. Do not create horizontal layers (e.g., "write all models, then all controllers").

Assign an agent tag to each task where appropriate:

- `[agent:debugger]` — tasks that involve tracing a bug or unexpected runtime behavior
- `[agent:test-auditor]` — tasks that involve writing or reviewing tests
- `[agent:code-reviewer]` — tasks that involve reviewing API surfaces, interfaces, or public contracts

### 4. Rewrite tasks.md

Overwrite `.tracerkit/changes/<slug>/tasks.md` with:

```
# Tasks: <slug>

## Tracer Bullets

- [ ] <slice 1 description> [agent:<tag>]
- [ ] <slice 2 description>
- [ ] <slice 3 description> [agent:<tag>]
...

## Notes

<any planning notes, dependencies, or open questions>
```

Rules:

- Each task is a single checkbox line
- At least one task must carry an `[agent:*]` tag
- Tasks are ordered: earliest slice first (the one that proves the happy path end-to-end)
- No task should be purely internal plumbing with no observable output

### 5. Confirm

Tell the user:

- How many tasks were written
- Which tasks carry agent tags
- Next step: implement the slices in order, then run `/tk:verify`
