# prd-phase-kit — Manifests, CI & Docs

Package manifest, per-agent manifests (Gemini extension, Claude plugin), agent context files, CI workflows, and the human docs.

> Create each file below at the exact path shown (relative to the repo root). Copy the contents verbatim.

### `.claude-plugin/marketplace.json`

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "prd-phase-kit",
  "description": "Spec-driven development workflow as Claude Code skills.",
  "owner": {
    "name": "ALIFKA-HUB",
    "url": "https://github.com/ALIFKA-HUB"
  },
  "plugins": [
    {
      "name": "prd-phase-kit",
      "description": "PRD -> phased plan -> per-phase execution with testing gate and git/changelog discipline.",
      "source": "./",
      "category": "productivity"
    }
  ]
}
```

### `.claude-plugin/plugin.json`

```json
{
  "name": "prd-phase-kit",
  "description": "Spec-driven development workflow: PRD -> phased plan -> per-phase execution with a testing gate and standardized git + changelog discipline.",
  "version": "0.1.0",
  "author": {
    "name": "ALIFKA-HUB",
    "url": "https://github.com/ALIFKA-HUB"
  }
}
```

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - name: Verify generated artifacts are in sync
        run: node scripts/sync.js --check
      - name: Run tests
        run: npm test
      - name: Installer smoke test (dry-run)
        run: node bin/install.js --all --dry-run
```

### `.github/workflows/sync.yml`

```yaml
name: Sync artifacts

# Single source of truth: skills/<name>/SKILL.md. This regenerates the
# commands/ TOML stubs and the plugins/ mirror, then commits any drift.
on:
  push:
    branches: [main]
    paths:
      - 'skills/**'
      - 'scripts/sync.js'

permissions:
  contents: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node scripts/sync.js
      - name: Commit regenerated artifacts
        run: |
          if [ -n "$(git status --porcelain commands plugins)" ]; then
            git config user.name "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            git add commands plugins
            git commit -m "chore(sync): regenerate commands and plugin mirror"
            git push
          else
            echo "Artifacts already in sync."
          fi
```

### `.gitignore`

```
node_modules/
dist/
*.log
.DS_Store
.env
.env.*
coverage/
*.tgz
skills.md
full-chat-log.md
```

### `AGENTS.md`

```markdown
# PRD Phase Kit — agent context

PRD Phase Kit is a spec-driven development workflow exposed as slash commands. The
single source of truth for each command is its `skills/<name>/SKILL.md`. Shared
rules live in `skills/_shared/conventions.md`. File templates live in
`templates/`.

Commands: `/init-prd`, `/make-plan`, `/start-task`, `/finish-task`, `/status`.

@./skills/init-prd/SKILL.md
@./skills/make-plan/SKILL.md
@./skills/start-task/SKILL.md
@./skills/finish-task/SKILL.md
@./skills/status/SKILL.md
@./skills/_shared/conventions.md
```

### `CONTRIBUTING.md`

````markdown
# Contributing to PRD Phase Kit

Thanks for helping improve PRD Phase Kit! This project dogfoods its own workflow —
where practical, changes go through PRD → plan → phased execution.

## Single source of truth

The **only** place to edit skill behavior is:

```
skills/<name>/SKILL.md       # the agent instructions (with YAML frontmatter)
skills/_shared/conventions.md # shared rules referenced by every skill
```

Everything else is generated:

- `commands/*.toml` — Gemini/Codex command stubs
- `plugins/prd-phase-kit/skills/**` — Claude-plugin mirror

**Never hand-edit generated files.** Run the sync after editing a skill:

```bash
npm run sync          # regenerate commands/ and plugins/
npm run sync:check    # verify nothing is stale (CI runs this)
```

CI also regenerates artifacts on push to `main` (`.github/workflows/sync.yml`),
so drift is corrected automatically — but please run `npm run sync` locally so
your PR diff is complete.

## Adding or editing a skill

1. Edit (or create) `skills/<name>/SKILL.md` with `name` + `description` frontmatter and the instruction body.
2. Run `npm run sync`.
3. Run `npm test`.
4. Commit `skills/`, `commands/`, and `plugins/` together.

## Adding an agent target

Agents are described in `bin/lib/providers.js` via the `PROVIDERS` array. Add an
entry with:

- `id`, `label`, `scope` (`user` | `project`)
- `dir({ home, cwd })` — where commands are written
- `detect({ home, cwd })` — heuristic for whether the agent is installed
- `file(skill)` — `{ filename, content }` in that agent's format

Then extend `tests/providers.test.mjs` if the format has new invariants.

## Tests

```bash
npm test
```

The suite checks skill loading, per-provider rendering, and artifact sync.

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/):
`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:` … with an optional
scope, e.g. `feat(installer): add windsurf target`.
````

### `GEMINI.md`

```markdown
# PRD Phase Kit

You have the PRD Phase Kit spec-driven workflow installed. It turns an idea into a
PRD, then a phased plan, then executes the plan one phase at a time with a strict
testing gate and standardized git + changelog discipline.

Commands:
- `/init-prd <idea>` — interview the user, write `docs/specs/<slug>/PRD.md`.
- `/make-plan` — read the PRD, write a phased `plan.md` (you pick the phase count, confirm with user).
- `/start-task [phase N]` — set up a git branch (after confirmation), implement the phase, run the testing gate, update `plan.md` progress. Does not commit.
- `/finish-task` — write `docs/changelog/<slug>/phase-NN.md`, then commit + push (after confirmation).
- `/status` — show phase progress from `plan.md`.

Always follow the Global Rules: never assume (ask in batched questions), never
commit on red/unknown tests, stop and ask on repeated errors, keep the spec in
sync with reality, and respond in the user's language.

Conventions: branches `feat/123-slug`, Conventional Commits (`feat(scope): ...`).
```

### `INSTALL.md`

````markdown
# Installing PRD Phase Kit

PRD Phase Kit ships its workflow as native slash-commands for each agent. The
installer reads `skills/<name>/SKILL.md` and writes the right file format into
each agent's command directory.

> Requires **Node.js ≥ 18** (ships with `npx`).

## Quick install

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/ALIFKA-HUB/prd-phase-kit/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/ALIFKA-HUB/prd-phase-kit/main/install.ps1 | iex
```

Or call the installer directly (no clone required):

```bash
npx github:ALIFKA-HUB/prd-phase-kit            # detected agents only
npx github:ALIFKA-HUB/prd-phase-kit --all      # every supported agent
npx github:ALIFKA-HUB/prd-phase-kit --only gemini,claude
npx github:ALIFKA-HUB/prd-phase-kit --list     # show detection status
npx github:ALIFKA-HUB/prd-phase-kit --dry-run  # preview without writing
npx github:ALIFKA-HUB/prd-phase-kit --uninstall
```

## Supported agents

| Agent | Scope | Installs to | Format |
| --- | --- | --- | --- |
| **Gemini CLI** | user | `~/.gemini/commands/` | `.toml` |
| **Claude Code** | user | `~/.claude/commands/` | `.md` + frontmatter |
| **Codex CLI** | user | `~/.codex/prompts/` | `.md` |
| **Cursor** | project | `<repo>/.cursor/commands/` | `.md` |
| **Windsurf** | project | `<repo>/.windsurf/workflows/` | `.md` + frontmatter |

- **user scope** → commands are available in every project on your machine.
- **project scope** → commands are written into the current repo (commit them so your team gets them too). Run the installer from your project root for these.

After installing, restart the agent (or reload commands) and you'll have
`/ppk-init-prd`, `/ppk-make-plan`, `/ppk-start-task`,
`/ppk-finish-task`, and `/ppk-status`.

## Gemini CLI as an extension (alternative)

PRD Phase Kit also ships a `gemini-extension.json`, so you can install it as a Gemini
extension instead of standalone commands:

```bash
gemini extensions install https://github.com/ALIFKA-HUB/prd-phase-kit
```

## Claude Code as a plugin (alternative)

The repo includes a `.claude-plugin/` manifest and a generated `plugins/prd-phase-kit/`
mirror, so it can be added as a Claude Code plugin marketplace:

```
/plugin marketplace add ALIFKA-HUB/prd-phase-kit
/plugin install prd-phase-kit
```

## Uninstall

```bash
npx github:ALIFKA-HUB/prd-phase-kit --uninstall          # detected agents
npx github:ALIFKA-HUB/prd-phase-kit --uninstall --all    # everywhere
```
````

### `LICENSE`

```
MIT License

Copyright (c) 2026 ALIFKA AREIGA ARKANA

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### `README.md`

````markdown
# PRD Phase Kit

**Spec-driven development workflow for AI coding agents.**

PRD Phase Kit turns a free-text idea into shipped code through a disciplined,
resumable pipeline:

```
/init-prd     ->  Q&A interview        ->  PRD.md
/make-plan    ->  read PRD             ->  phased plan.md (AI proposes phases)
/start-task   ->  branch + implement   ->  one phase, with a testing gate
/finish-task  ->  changelog + commit   ->  push (per phase)
/status       ->  read plan.md         ->  progress overview
```

It installs as native slash-commands for **Gemini CLI** (primary target) and
works across **Claude Code, Codex, Cursor, and Windsurf** from the same source.

## Why

Most agent failures come from skipping discipline: no spec, no plan, no tests
before commit, messy git history. PRD Phase Kit bakes that discipline into the
commands themselves:

- **Q&A-first PRD** — the agent asks (batched) before it builds; no silent assumptions.
- **Phased plan** — the agent proposes the number of phases based on your prompt; each phase is small (target ≤ ~400 lines / 1 PR).
- **Resume-aware** — picks up an interrupted phase from the first unchecked task.
- **Testing gate** — never commits with red tests; runs test + lint + typecheck + build first; stops and asks after 3 repeated failures.
- **Spec stays alive** — if the PRD/plan turns out wrong mid-phase, the agent stops, fixes the spec (with your OK), then continues.
- **Standardized git + changelog** — Conventional Commits, `type/issue-slug` branches, a changelog file per phase.
- **Definition of Done** — every phase carries ≥ 1 machine-checkable command that must exit green.

## Install

```bash
# One-liner (auto-detects your installed agents):
curl -fsSL https://raw.githubusercontent.com/ALIFKA-HUB/prd-phase-kit/main/install.sh | bash

# Or run the installer directly with npx (no clone):
npx github:ALIFKA-HUB/prd-phase-kit            # install for detected agents
npx github:ALIFKA-HUB/prd-phase-kit --all      # install for every supported agent
npx github:ALIFKA-HUB/prd-phase-kit --list     # show agents + detection status
```

See [INSTALL.md](INSTALL.md) for per-agent details and Windows instructions.

## Commands

| Command | Purpose |
| --- | --- |
| `/ppk-init-prd` | Interview the user and write `PRD.md`. |
| `/ppk-make-plan` | Turn the PRD into a phased `plan.md`. |
| `/ppk-start-task` | Execute one phase (branch → code → testing gate → update plan). |
| `/ppk-finish-task` | Write the changelog and produce the git commit/push. |
| `/ppk-status` | Print the progress overview from `plan.md`. |

Files live under:

```
docs/specs/<feature-slug>/PRD.md
docs/specs/<feature-slug>/plan.md
docs/changelog/<feature-slug>/phase-NN.md
```

## Repo layout

```
skills/<name>/SKILL.md   # single source of truth (the agent instructions)
skills/_shared/          # shared conventions (git, testing gate, global rules)
templates/               # PRD / plan / changelog templates
bin/install.js           # multi-agent installer
commands/                # generated TOML stubs (do not hand-edit)
plugins/prd-phase-kit/        # generated Claude-plugin mirror (do not hand-edit)
scripts/sync.js          # regenerates commands/ + plugins/ from skills/
```

> **Single source of truth:** edit skills only in `skills/<name>/SKILL.md`.
> `commands/` and `plugins/` are regenerated by `npm run sync` (and by CI).

## Development

```bash
npm test          # run the test suite
npm run sync      # regenerate commands/ and plugins/ from skills/
npm run sync:check # fail if artifacts are stale (used in CI)
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
````

### `gemini-extension.json`

```json
{
  "name": "prd-phase-kit",
  "version": "0.1.0",
  "description": "Spec-driven development workflow: /init-prd, /make-plan, /start-task, /finish-task, /status.",
  "contextFileName": "GEMINI.md"
}
```

### `package.json`

```json
{
  "name": "prd-phase-kit",
  "version": "0.1.0",
  "description": "PRD Phase Kit — spec-driven development workflow (PRD -> phased plan -> per-phase execution) as installable slash-commands for AI coding agents.",
  "license": "MIT",
  "author": "ALIFKA-HUB",
  "homepage": "https://github.com/ALIFKA-HUB/prd-phase-kit",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ALIFKA-HUB/prd-phase-kit.git"
  },
  "bugs": {
    "url": "https://github.com/ALIFKA-HUB/prd-phase-kit/issues"
  },
  "bin": {
    "prd-phase-kit": "./bin/install.js"
  },
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "test": "node --test",
    "sync": "node scripts/sync.js",
    "sync:check": "node scripts/sync.js --check",
    "lint": "node scripts/sync.js --check"
  },
  "files": [
    "bin/",
    "skills/",
    "templates/",
    "commands/",
    "plugins/",
    ".claude-plugin/",
    "gemini-extension.json",
    "GEMINI.md",
    "AGENTS.md",
    "README.md",
    "INSTALL.md",
    "CONTRIBUTING.md",
    "install.sh",
    "install.ps1",
    "LICENSE"
  ]
}
```

