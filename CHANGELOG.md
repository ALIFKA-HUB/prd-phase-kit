# Changelog

All notable changes to PRD Phase Kit are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

---

## [0.1.0] — 2026-06-25

Initial public release.

### Added

- **`/ppk-init-prd`** — Interview the user and write `docs/specs/<slug>/PRD.md`
- **`/ppk-make-plan`** — Read the PRD, produce a phased `plan.md`
- **`/ppk-start-task`** — Set up a git branch, implement the phase, run tests, update progress
- **`/ppk-finish-task`** — Write `docs/changelog/<slug>/phase-NN.md`, commit + push
- **`/ppk-status`** — Print Progress Overview and per-phase status from `plan.md`
- **`/ppk-reset`** — Reset one or all phases in `plan.md` back to todo (with confirmation gate)
- Installer (`npx github:ALIFKA-HUB/prd-phase-kit`) with auto-detection for 5 agents:
  Gemini CLI, Claude Code, Codex CLI, Cursor, Windsurf
- CLI flags: `--all`, `--only <a,b>`, `--list`, `--dry-run`, `--uninstall`
- TOML command stubs for Gemini CLI / Codex (`commands/ppk-*.toml`)
- Claude Code plugin mirror (`plugins/prd-phase-kit/skills/`)
- CRLF normalization in `parseSkill()` — Windows-safe parsing
- Helpful error messages for corrupt SKILL.md and permission-denied scenarios
- Shared conventions (`skills/_shared/conventions.md`) — global rules inherited by all commands
- 33 automated tests covering: parser edge cases, installer CLI flags, sync artifact integrity

### Fixed

- `parseSkill()` regex failed on Windows CRLF line endings (`\r\n`)
- `shortDesc` naming mismatch between `providers.js` and `sync.js`
- Duplicate `parseSkill` / `tomlLiteral` / `shortDesc` logic between `sync.js` and `bin/lib/`

[Unreleased]: https://github.com/ALIFKA-HUB/prd-phase-kit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ALIFKA-HUB/prd-phase-kit/releases/tag/v0.1.0
