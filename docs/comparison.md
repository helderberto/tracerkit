# Comparison

**No tool at all.** AI coding without specs means vague prompts and lost context between sessions. TracerKit adds structure without ceremony.

**[Spec Kit](https://github.com/github/spec-kit)** (GitHub). Thorough but heavyweight: 5 phases, Python setup, rigid phase gates. TracerKit is 3 phases, zero deps, automated verification.

**[Kiro](https://kiro.dev/)** (AWS). Powerful but locked to a dedicated IDE. TracerKit works inside Claude Code with Markdown skills and a lightweight CLI.

**[OpenSpec](https://github.com/Fission-AI/OpenSpec)**. Similar philosophy, supports more AI tools. TracerKit trades breadth (Claude Code only) for depth: built-in skill discovery, automated verification, and fewer artifacts.

## Full comparison

|                    | Spec Kit         | Kiro                       | OpenSpec                | TracerKit                                     |
| ------------------ | ---------------- | -------------------------- | ----------------------- | --------------------------------------------- |
| **What it is**     | CLI + extensions | Agentic IDE (VS Code fork) | Slash-command framework | Deterministic CLI + AI skills                 |
| **Setup**          | Python + uv      | Dedicated IDE              | npm + init              | `npm install -g tracerkit`                    |
| **Phases**         | 5                | 3                          | 3                       | 3 (prd, plan, check)                          |
| **Artifacts**      | 4 files          | 3+ files                   | 4+ files                | 2 files (PRD, plan)                           |
| **Verification**   | Manual gates     | Diff approval              | Manual                  | Automated (`done` or `in_progress`)           |
| **CLI + AI split** | —                | —                          | —                       | CLI: deterministic data; skills: AI reasoning |
| **Tool lock-in**   | Any AI assistant | Kiro IDE only              | Any AI assistant        | Claude Code only                              |
| **Runtime deps**   | Python + uv      | Proprietary IDE            | None                    | Node.js (global install)                      |
