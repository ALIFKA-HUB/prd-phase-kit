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

---

## Repository Anatomy

Understanding the folder structure makes it easy to navigate and contribute.

```
prd-phase-kit/
│
├── skills/                          ← SOURCE OF TRUTH for all commands
│   ├── _shared/
│   │   └── conventions.md           ← Global rules inherited by every skill
│   ├── init-prd/SKILL.md
│   ├── make-plan/SKILL.md
│   ├── start-task/SKILL.md
│   ├── finish-task/SKILL.md
│   ├── status/SKILL.md
│   └── reset/SKILL.md
│
├── commands/                        ← GENERATED — do not edit
│   └── ppk-*.toml                   ← Gemini CLI command files
│
├── plugins/                         ← GENERATED — do not edit
│   └── prd-phase-kit/skills/        ← Claude/Windsurf/Codex/Cursor mirrors
│
├── bin/
│   ├── install.js                   ← CLI entry point (npx / node bin/install.js)
│   └── lib/
│       ├── skills.js                ← parseSkill(), loadSkills()
│       ├── providers.js             ← shortDesc(), tomlLiteral(), per-agent renderers
│       └── context.js              ← resolves home dir, install paths per agent
│
├── scripts/
│   └── sync.js                      ← Reads skills/, writes commands/ + plugins/
│
├── tests/
│   ├── install.test.mjs             ← CLI flag tests (--help, --list, --dry-run, etc.)
│   ├── parseSkill.test.mjs          ← Unit tests for parseSkill() edge cases
│   ├── skills.test.mjs              ← Integration: loadSkills(), command format checks
│   └── sync.test.mjs               ← Sync pipeline: artifact freshness, file counts
│
├── templates/
│   ├── PRD.md                       ← Template used by /ppk-init-prd
│   └── changelog.md                 ← Template used by /ppk-finish-task
│
├── docs/
│   ├── architecture-diagram.md      ← Mermaid diagrams of the full workflow
│   ├── trust-foundation.md          ← Why Trust This Workflow? (long form)
│   └── specs/                       ← PRDs created by /ppk-init-prd (gitignored drafts)
│
├── examples/
│   └── demo-output/                 ← Sample PRD, plan, changelog (realistic examples)
│
└── .github/
    └── workflows/                   ← CI (test.yml runs npm test on push/PR)
```

**Key rule:** `skills/` → `scripts/sync.js` → `commands/` + `plugins/`. This pipeline is the only sanctioned way to update agent command files.

---

## The Iterative Mindset of Prompt Engineering

If you're new to contributing AI skills, one thing stands out: **the commit history
for a single skill often has many small commits.** This is normal and intentional.

### Why so many commits per skill?

Prompt engineering is empirical, not deductive. You can't fully reason your way
to a perfect prompt — you write a draft, test it against real agent behavior,
observe unexpected outputs, and refine. The cycle looks like:

```
Write prompt → Test with agent → Observe edge case → Patch → Repeat
```

Edge cases surface gradually:
- What if the user provides no argument?
- What if the plan.md doesn't exist yet?
- What if the agent interprets "phase 2" as a filename?
- What if tests are failing but the user insists on committing anyway?

Each of these becomes a small, focused commit: `fix(start-task): handle missing plan.md gracefully`.

### What this means for contributors

- **Small PRs are preferred.** One edge case, one fix, one commit.
- **Test with your actual agent.** The tests in `tests/` verify structure and
  artifact sync — they don't run the skill in a live agent session.
  Manual testing against your agent of choice is part of the workflow.
- **Document the edge case.** If you add a guard to a skill, add a comment or
  example in the SKILL.md body so the next contributor understands why it's there.
- **Don't over-engineer upfront.** A skill that handles 80% of real cases cleanly
  is better than one that handles 100% of theoretical cases with ten nested conditionals.

### The meta-workflow

PRD Phase Kit itself is built using PRD Phase Kit. The `implementation_plan.md` (now
archived post-execution) was generated by `/ppk-make-plan`. Each phase was committed
via `/ppk-finish-task`. The changelog lives in `docs/changelog/`. This is the
strongest possible dogfood signal: the tool is good enough to build itself with.
