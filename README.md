# PRD Phase Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node ≥ 18](https://img.shields.io/badge/Node-%E2%89%A518-brightgreen)](https://nodejs.org)
[![Build](https://img.shields.io/github/actions/workflow/status/ALIFKA-HUB/prd-phase-kit/test.yml?label=tests)](https://github.com/ALIFKA-HUB/prd-phase-kit/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **Spec first. Test gate. One phase at a time.**
> Turn a free-text idea into shipped, auditable code — as native slash-commands for your AI agent.

---

## How It Works

```
💡 Idea
  │
  ▼
/ppk-init-prd          →  docs/specs/<slug>/PRD.md
  │  (interview user, write spec)
  ▼
/ppk-make-plan         →  plan.md  (N phases)
  │  (read PRD, break into phases)
  ▼
/ppk-start-task        →  git branch + implementation
  │  (implement one phase, run tests)
  ▼
🔴 tests fail? ──────────────── fix → retry
  │
🟢 tests pass
  │
  ▼
/ppk-finish-task       →  changelog + commit + PR + merge
  │  (write docs/changelog/<slug>/phase-NN.md)
  ▼
✅ Phase shipped
  │
  ▼  (repeat for each phase)
🚀 Feature complete
```

---

## Commands

| Command | What you provide | What you get | Commits? |
|---------|-----------------|--------------|----------|
| `/ppk-init-prd` | Free-text idea | `docs/specs/<slug>/PRD.md` | No |
| `/ppk-make-plan` | PRD.md | `plan.md` with N phases | No |
| `/ppk-start-task [phase N]` | phase number (optional) | Implemented phase on a git branch | No |
| `/ppk-finish-task` | Passing tests | `docs/changelog/<slug>/phase-NN.md` + squash commit | **Yes** |
| `/ppk-status` | — | Phase progress from `plan.md` | No |
| `/ppk-reset [phase N\|all]` | phase number or `all` | Phase status reset to `todo` | No |

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

Verify: `node bin/install.js --list`

---

## Supported Agents

| Agent | Install scope | Format |
|-------|--------------|--------|
| Gemini CLI | user (`~/.gemini/commands/`) | `.toml` |
| Claude Code | user (`~/.claude/commands/`) | `.md` |
| Codex CLI | user (`~/.codex/prompts/`) | `.md` |
| Cursor | project (`.cursor/commands/`) | `.md` |
| Windsurf | project (`.windsurf/workflows/`) | `.md` |

---

## Why Trust This Workflow?

**Because the AI can't skip the rules.**

The spec, the test gate, and the commit discipline are all embedded directly
into the agent's prompt — not a convention that gets forgotten.

| Concern | How PRD Phase Kit handles it |
|---------|------------------------------|
| "Will the AI go rogue?" | Spec-locked + test-gated. No commit on red. |
| "Will it work on my agent?" | 5 agents supported, all synced from one source. |
| "Can I audit what changed?" | Changelog + git history per phase. |
| "What if requirements change?" | Edit the PRD, re-run `/ppk-make-plan`. |
| "What if a phase breaks things?" | One squash commit — `git revert` in 10 s. |

→ Full explanation: [docs/trust-foundation.md](docs/trust-foundation.md)  
→ Architecture diagrams: [docs/architecture-diagram.md](docs/architecture-diagram.md)

---

## More

- [INSTALL.md](INSTALL.md) — install options, flags, troubleshooting
- [CONTRIBUTING.md](CONTRIBUTING.md) — dev workflow, adding skills
- [CHANGELOG.md](CHANGELOG.md) — release history
- [LICENSE](LICENSE) — MIT
