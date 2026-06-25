# Installing PRD Phase Kit

PRD Phase Kit ships its workflow as native slash-commands for each agent. The
installer reads `skills/<name>/SKILL.md` and writes the right file format into
each agent's command directory.

> Requires **Node.js ≥ 18** (ships with `npx`).

---

## Quick Install

**npx (recommended — always latest):**
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

The installer **auto-detects** which agents are present and installs only for those.

---

## CLI Flags

```
Usage:
  npx github:ALIFKA-HUB/prd-phase-kit [options]

Options:
  --all              Install for every supported agent (even if not detected)
  --only <a,b>       Install only for the named agents (comma-separated)
  --list             List supported agents and detection status, then exit
  --dry-run, -n      Show what would be written without writing
  --uninstall        Remove previously installed PRD Phase Kit commands
  -h, --help         Show this help
```

**Examples:**
```bash
# Install only for Claude and Gemini
npx github:ALIFKA-HUB/prd-phase-kit --only claude,gemini

# Preview what would be installed
npx github:ALIFKA-HUB/prd-phase-kit --dry-run --all

# Remove all installed commands
npx github:ALIFKA-HUB/prd-phase-kit --uninstall
```

---

## Supported Agents

| ID | Agent | Scope | Command Dir | Format |
|----|-------|-------|-------------|--------|
| `gemini` | Gemini CLI | user | `~/.gemini/commands/` | `.toml` |
| `claude` | Claude Code | user | `~/.claude/commands/` | `.md` |
| `codex` | Codex CLI | user | `~/.codex/prompts/` | `.md` |
| `cursor` | Cursor | project | `.cursor/commands/` | `.md` |
| `windsurf` | Windsurf | project | `.windsurf/workflows/` | `.md` |

**User scope** — installed once in your home dir, available in all projects.
**Project scope** — installed in the current repo, committed with the project.

**Verify detection:**
```bash
node bin/install.js --list
```

---

## Troubleshooting

### Node version too old
```
Error: The engine "node" is incompatible with this module.
```
Upgrade to Node.js ≥ 18: https://nodejs.org

### `npx` not found
`npx` ships with Node.js ≥ 5.2. If missing:
```bash
npm install -g npm   # update npm, npx comes with it
```

### Permission denied (Linux/macOS)
The installer writes to your home dir — no `sudo` needed. If you see permission errors:
```bash
ls -la ~/.gemini/commands/   # check owner
# Fix: chown -R $USER ~/.gemini
```

### Permission denied (Windows)
Run your terminal **as Administrator**, or use:
```powershell
npx github:ALIFKA-HUB/prd-phase-kit --only gemini
```

### No agents detected
```
No supported AI agents detected.
Use `--all` to install for every agent, or `--only <agent>` to pick one.
```
Use `--all` to install regardless, then restart your agent to pick up the commands.

### Commands not showing up
Restart your agent (or reload its command palette) after install. Some agents need a full restart to discover new commands.
