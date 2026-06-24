# prd-phase-kit — Repository Structure

Build a repo with exactly this layout. `commands/` and `plugins/` are **generated** — do not write them by hand; run `npm run sync` after creating `skills/`.

```
prd-phase-kit/
├── skills/
│   ├── _shared/
│   │   └── conventions.md        # rules inherited by every command
│   ├── init-prd/SKILL.md         # /ppk-init-prd
│   ├── make-plan/SKILL.md        # /ppk-make-plan
│   ├── start-task/SKILL.md       # /ppk-start-task
│   ├── finish-task/SKILL.md      # /ppk-finish-task
│   └── status/SKILL.md           # /ppk-status
├── templates/
│   ├── PRD.md
│   ├── plan.md
│   └── changelog.md
├── bin/
│   ├── install.js                # multi-agent installer (CLI entry)
│   └── lib/
│       ├── skills.js             # parse + load SKILL.md files
│       └── providers.js          # per-agent targets (gemini/claude/codex/cursor/windsurf)
├── scripts/
│   └── sync.js                   # regenerate commands/ + plugins/ from skills/
├── tests/
│   ├── skills.test.mjs
│   ├── providers.test.mjs
│   └── sync.test.mjs
├── commands/                     # GENERATED (npm run sync) — Gemini/Codex .toml stubs
├── plugins/prd-phase-kit/        # GENERATED (npm run sync) — Claude plugin mirror
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── .github/workflows/
│   ├── ci.yml                    # test matrix + sync check
│   └── sync.yml                  # auto-regenerate artifacts on push to main
├── gemini-extension.json         # Gemini CLI extension manifest
├── GEMINI.md                     # Gemini context file
├── AGENTS.md                     # generic agent context file
├── package.json
├── README.md / INSTALL.md / CONTRIBUTING.md
├── install.sh / install.ps1      # one-liner installer shims
├── .gitignore
└── LICENSE
```

## Build order

1. Create everything in **02-skills-and-templates.md** (the source of truth).
2. Create everything in **03-installer-and-scripts.md**.
3. Create everything in **04-manifests-and-docs.md**.
4. Run `npm run sync` to generate `commands/` and `plugins/prd-phase-kit/`.
5. Run `npm test` — all tests must pass.
6. (optional) `node bin/install.js --list` to confirm the installer loads.
