# Build prompt for Antigravity — create the `prd-phase-kit` repo

Paste these files into Antigravity in order. They describe a complete,
ready-to-publish project, so Antigravity should **create each file exactly as
given** rather than improvise.

## What you're building

**prd-phase-kit** — a spec-driven development workflow packaged as installable
slash-commands for AI coding agents (Gemini CLI primary; also Claude Code,
Codex, Cursor, Windsurf). The workflow:

```
/ppk-init-prd    Q&A interview        -> PRD.md
/ppk-make-plan   read PRD             -> phased plan.md
/ppk-start-task  branch + implement   -> one phase, with a testing gate
/ppk-finish-task changelog + commit   -> push (per phase)
/ppk-status      read plan.md         -> progress overview
```

## How to use these files

Give Antigravity the files in this order:

1. **01-structure.md** — the target repo layout + build order.
2. **02-skills-and-templates.md** — the source of truth (skills + templates).
3. **03-installer-and-scripts.md** — installer, sync script, tests.
4. **04-manifests-and-docs.md** — package.json, manifests, CI, docs.

## Hard rules for the agent (do not skip)

- Create files at the **exact paths** shown, with **verbatim** contents.
- **Do NOT hand-write** `commands/` or `plugins/prd-phase-kit/` — those are
  generated. After creating `skills/`, run `npm run sync` to produce them.
- After everything is created, run:
  - `npm run sync` (generates `commands/` + `plugins/`)
  - `npm test` (must pass)
  - `node bin/install.js --list` (smoke check)
- Single source of truth: skills are edited only in `skills/<name>/SKILL.md`.
- Use Conventional Commits; do not commit secrets.
