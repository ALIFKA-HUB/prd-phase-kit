# PRD Phase Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node ≥ 18](https://img.shields.io/badge/Node-%E2%89%A518-brightgreen)](https://nodejs.org)

**Spec-driven development workflow for AI coding agents.**

PRD Phase Kit turns a free-text idea into shipped code through a disciplined, resumable pipeline — as native slash-commands for your agent.

```
/ppk-init-prd  →  /ppk-make-plan  →  /ppk-start-task  →  /ppk-finish-task
    (idea)           (phased plan)       (implement)          (commit + log)
```

---

## Quick Install

**npx (recommended):**
```bash
npx github:ALIFKA-HUB/prd-phase-kit
```

**curl (Linux/macOS):**
```bash
curl -fsSL https://raw.githubusercontent.com/ALIFKA-HUB/prd-phase-kit/main/install.sh | bash
```

**PowerShell (Windows):**
```powershell
irm https://raw.githubusercontent.com/ALIFKA-HUB/prd-phase-kit/main/install.ps1 | iex
```

---

## Commands

| Command | Input | Output | Commits? |
|---------|-------|--------|----------|
| `/ppk-init-prd` | Free-text idea | `docs/specs/<slug>/PRD.md` | No |
| `/ppk-make-plan` | PRD.md | `plan.md` (phased) | No |
| `/ppk-start-task [phase N]` | plan.md | Implemented phase | No |
| `/ppk-finish-task` | Done phase | `docs/changelog/<slug>/phase-NN.md` | Yes |
| `/ppk-status` | plan.md | Progress overview | No |
| `/ppk-reset [phase N\|all]` | plan.md | Reset phase to todo | No |

---

## Supported Agents

| Agent | Scope | Format |
|-------|-------|--------|
| Gemini CLI | user (`~/.gemini/commands/`) | `.toml` |
| Claude Code | user (`~/.claude/commands/`) | `.md` |
| Codex CLI | user (`~/.codex/prompts/`) | `.md` |
| Cursor | project (`.cursor/commands/`) | `.md` |
| Windsurf | project (`.windsurf/workflows/`) | `.md` |

After install, run: `node bin/install.js --list` to verify detection.

---

## More

- [INSTALL.md](INSTALL.md) — install options, flags, troubleshooting
- [CONTRIBUTING.md](CONTRIBUTING.md) — dev workflow, adding skills
- [LICENSE](LICENSE) — MIT
