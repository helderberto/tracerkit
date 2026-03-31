# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- CLI `init` command with template engine to scaffold plugin files into a project
- `/tk:prd` skill — interactive interview to define a feature, writes `prds/<slug>.md`
- `/tk:plan` skill — breaks a PRD into phased tracer-bullet vertical slices, writes `plans/<slug>.md`
- `/tk:verify` skill — read-only review that stamps PASS or NEEDS_WORK, auto-archives on PASS
- Plugin manifest (`.claude-plugin/plugin.json`) for Claude Code discovery
- Comparison table in README (Spec Kit, Kiro, OpenSpec, TracerKit)
- Collapsible usage examples in README (new feature, PRD iteration, bug fix, verify loop)
- ESLint, Prettier, Husky, and commitlint configuration
- Test suite for CLI init, template engine

### Fixed

- Missing argument handling in PRD skill
- Stale `/tk:propose` references after skill was removed

### Removed

- `/tk:archive` skill — merged into `/tk:verify` (auto-archives on PASS)

### Changed

- Moved `.claude-plugin/` and `skills/` into `templates/` directory (symlinked at root)
- Restructured skills to match Claude Code plugin format
- Simplified workflow from 4 steps to 3 (prd → plan → verify)
- Simplified workflow — dropped `planning.md` and `.tracerkit/changes/` in favor of `prds/` + `plans/`
