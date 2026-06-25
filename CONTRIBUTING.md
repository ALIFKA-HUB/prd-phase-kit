# Contributing to PRD Phase Kit

Thanks for helping improve PRD Phase Kit! This project dogfoods its own workflow —
where practical, changes go through PRD → plan → phased execution.

---

## Single Source of Truth

The **only** place to edit skill behavior is:

```
skills/<name>/SKILL.md
```

Never edit generated files directly. They are overwritten by `npm run sync`.

Generated files (do not edit manually):
- `commands/ppk-*.toml` — Gemini CLI / Codex stubs
- `plugins/prd-phase-kit/skills/**` — Claude Code plugin mirror

---

## Dev Workflow

```
# 1. Edit the skill
edit skills/<name>/SKILL.md

# 2. Regenerate artifacts
npm run sync

# 3. Verify everything in sync
npm run sync:check

# 4. Run tests
npm test
```

All four steps must pass before committing.

---

## How to Add a New Skill

1. Create directory: `skills/<name>/`
2. Create `skills/<name>/SKILL.md` with frontmatter:

```markdown
---
name: <name>
description: >
  One-paragraph description. First sentence used as command summary.
---

# Skill body here
...
```

3. Run `npm run sync` — generates `commands/ppk-<name>.toml` + plugin mirror
4. Update tests: `loadSkills()` expects N+1 skills
5. Run `npm test` — all pass

**Required frontmatter fields:** `name`, `description`

**Naming:** skill dir name → command name `ppk-<name>`. Keep it short, verb-first (`init-prd`, `make-plan`).

---

## Shared Conventions

`skills/_shared/conventions.md` — inherited by every skill. Contains global rules (testing gate, anti-loop budget, no silent scope changes). Edit here affects all commands.

---

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types: feat | fix | docs | refactor | test | chore
Scope: optional, e.g. skills, installer, sync, tests

Examples:
  feat(skills): add /ppk-reset command
  fix: normalize CRLF in parseSkill
  docs: rewrite README with install guide
  test: add parseSkill edge case tests
  refactor: dedup parseSkill, sync.js imports from bin/lib
  chore: add CHANGELOG.md and package.json keywords
```

---

## PR Checklist

Before opening a pull request:

- [ ] `npm run sync` — artifacts regenerated
- [ ] `npm run sync:check` — exits 0 (artifacts in sync)
- [ ] `npm test` — all tests pass
- [ ] New skill? Tests updated (`loadSkills()` count)
- [ ] New feature? CONTRIBUTING.md updated if dev workflow changes
- [ ] Commit messages follow Conventional Commits

---

## Running Tests

```bash
npm test                 # run all tests (node --test)
npm run sync:check       # verify generated artifacts are in sync
node bin/install.js --list   # smoke check: lists all agents + detection status
```
