# prd-phase-kit — Skills & Templates

These are the **single source of truth**. Each `skills/<name>/SKILL.md` is one slash-command; `skills/_shared/conventions.md` holds the rules every command inherits; `templates/` are the PRD/plan/changelog templates the commands write.

> Create each file below at the exact path shown (relative to the repo root). Copy the contents verbatim.

### `skills/_shared/conventions.md`

````markdown
# PRD Phase Kit — Shared Conventions & Global Rules

Every PRD Phase Kit command (`/ppk-init-prd`, `/ppk-make-plan`, `/ppk-start-task`, `/ppk-finish-task`,
`/ppk-status`) inherits the rules below. This file is the single source of truth for
conventions; individual `SKILL.md` files restate only the critical gates.

## Global Rules (always apply)

1. **Never assume — ask.** If the framework, language, library, database,
   runtime, deployment target, or any requirement is ambiguous, STOP and ask the
   user. Batch related questions into one message (don't drip them one by one).
2. **Testing gate.** NEVER run `git commit` until the user has confirmed the code
   is tested and working, OR you have run the checks yourself and they pass. If
   tests fail or status is unknown, do not commit.
3. **Fallback on error + anti-loop budget.** On any error: (a) STOP immediately,
   (b) explain the error in plain language with the relevant output, (c) propose
   options, (d) WAIT for user confirmation before touching the changelog or
   running git. If you hit the **same error 3 times in a row**, stop, summarize
   what you tried, and ask the user — never loop on the same failing fix.
4. **No silent scope changes.** Only implement what the current phase covers.
   Out-of-scope discoveries go into `plan.md` as new tasks/phases, not into the
   current commit.
5. **Source of truth.** `plan.md` is the single source of truth for progress.
   Re-read it before acting; update it after finishing.
6. **One change, one place.** Don't duplicate state. Progress lives only in
   `plan.md` checkboxes + phase `status` fields.
7. **Keep the spec alive.** If you discover the PRD/plan is wrong, incomplete, or
   contradicts reality, STOP, propose the fix to `PRD.md`/`plan.md`, get user
   confirmation, update those files, then continue. Never write code that
   silently diverges from the spec.
8. **Respond in the user's language.** These files are English for the agent, but
   reply to the user in whatever language they write in (e.g. Indonesian).
9. **Guardrail files (optional).** If a `.ppk-guardrails` file exists in the project root, the agent MUST read it before any phase. It lists files/dirs the agent must NOT modify without explicit user permission. Format: one glob pattern per line.

## File & folder layout

```
docs/
  specs/<feature-slug>/
    PRD.md            # from /ppk-init-prd
    plan.md           # from /ppk-make-plan
  changelog/<feature-slug>/
    phase-01.md       # from /ppk-finish-task
    phase-02.md
```

`<feature-slug>` is kebab-case from the feature name, e.g. `user-authentication`.

## Branch & commit conventions

- **Branch:** `<type>/<issue-number>-<short-slug>`
  - examples: `feat/123-user-auth`, `fix/45-dashboard-ui`, `chore/12-ci-cache`
  - `<type>` ∈ `feat | fix | chore | refactor | docs | test | perf`
  - no issue number? omit it: `feat/user-auth`
- **Commit message:** [Conventional Commits](https://www.conventionalcommits.org/)
  - format: `<type>(<scope>): <description>`
  - imperative mood, lowercase, no trailing period
  - examples: `feat(auth): add JWT login endpoint`,
    `fix(dashboard): correct chart overflow on mobile`

## The workflow at a glance

```
/ppk-init-prd  ──►  /ppk-make-plan  ──►  /ppk-start-task  ──►  /ppk-finish-task   (loop per phase)
  PRD.md         plan.md         code+branch         changelog + push
```
````

### `skills/finish-task/SKILL.md`

````markdown
---
name: finish-task
description: >
  Final step per PRD Phase Kit phase. Re-confirms the testing gate, writes a
  standardized change log to docs/changelog/<feature-slug>/phase-NN.md, then
  prints git add/commit/push commands and waits for confirmation. Use when the
  user runs /ppk-finish-task, says "selesaikan phase ini", "log perubahan & push",
  after a phase has passed its testing gate.
---

# /ppk-finish-task — Log changes and push

**Trigger:** `/ppk-finish-task` (run after a phase passes its testing gate)

**Goal:** Write a standardized change log, then commit and push.

## Steps

1. **Re-confirm the testing gate.** If the user hasn't confirmed tests pass, STOP
   and ask. Never commit on red/unknown tests (Global Rule #2).
2. Collect the diff for the phase (`git status`, `git diff`) and write
   `docs/changelog/<feature-slug>/phase-<NN>.md` using the template in
   `templates/changelog.md`. Record phase number, files added/modified/deleted,
   line ranges, and the reason for each change.
3. Present the changelog file to the user.
4. **Print the git commands and WAIT for confirmation** before running them:
   ```bash
   git add .
   git commit -m "<type>(<scope>): <description matching the phase>"
   git push origin <type>/<issue>-<slug>
   ```
5. Confirm completion and point the user to the next phase via `/ppk-start-task`.

## Global rules (always apply)

- Re-confirm the testing gate before committing.
- Wait for confirmation before running git commands.
- Respond in the user's language.
- See `skills/_shared/conventions.md` for the full rule set.
````

### `skills/init-prd/SKILL.md`

```markdown
---
name: init-prd
description: >
  Start the PRD Phase Kit spec-driven workflow. Through a batched Q&A interview, turn
  the user's free-text idea into a clear PRD.md (Product Requirements Document).
  Use when the user runs /ppk-init-prd, says "buat PRD", "start a spec", "bikin
  requirement", or describes a feature they want to build from scratch.
---

# /ppk-init-prd — Generate the PRD

**Trigger:** `/ppk-init-prd <free-text description of what the user wants>`

**Goal:** Through a Q&A interview, turn the user's raw prompt into a clear
`docs/specs/<feature-slug>/PRD.md`.

## Steps

1. Read the user's prompt and identify everything unclear or missing: target
   users, problem, scope, framework/stack preferences, constraints, success
   criteria, non-goals.
2. Ask the user a **batched** list of clarifying questions (numbered, grouped).
   Keep asking follow-up rounds until you have enough certainty to write a
   confident PRD. NEVER invent a framework/library/decision — ask.
3. Propose a `<feature-slug>` (kebab-case) and confirm it with the user.
4. Write `docs/specs/<feature-slug>/PRD.md` using the template in
   `templates/PRD.md`.
5. Show the user a short summary and the file path, then ask for approval. Do
   NOT auto-run `/ppk-make-plan`.

## Global rules (always apply)

- Never assume — ask, in batched questions.
- Respond in the user's language.
- See `skills/_shared/conventions.md` for the full rule set.
```

### `skills/make-plan/SKILL.md`

```markdown
---
name: make-plan
description: >
  Second step of PRD Phase Kit. Read an approved PRD.md and produce a phased
  implementation plan (plan.md). The agent decides a sensible number of phases
  based on scope and confirms the count with the user. Use when the user runs
  /ppk-make-plan, says "bikin implementation plan", "buat plan dari PRD", or
  references @files:PRD.md.
---

# /ppk-make-plan — Generate the phased implementation plan

**Trigger:** `/ppk-make-plan @files:PRD.md` (or run after `/ppk-init-prd`)

**Goal:** Read the PRD and produce `docs/specs/<feature-slug>/plan.md`, broken
into **phases**, each containing concrete tasks.

## Steps

1. Read `docs/specs/<feature-slug>/PRD.md`.
2. **Decide the number of phases** based on the PRD's scope — you choose a
   sensible count (do not hardcode). Present the proposed phase breakdown to the
   user and ask them to confirm or adjust the total before writing the file.
3. Each phase must be independently shippable where possible (1 phase → 1 branch
   → 1 PR). Order phases by dependency.
   - **Size limit:** keep each phase reviewable in one PR (~≤ 400 changed lines).
     If a phase is bigger, split it into sub-phases — big phases = hard reviews =
     bugs slip through.
4. Each phase MUST have a **Definition of Done** with at least one
   machine-checkable check (an exact command that must exit green).
5. Write `plan.md` using the template in `templates/plan.md`.
6. Show the user the plan and the file path. Do NOT auto-start a task.

## Global rules (always apply)

- Confirm the phase count with the user before writing.
- Respond in the user's language.
- See `skills/_shared/conventions.md` for the full rule set.
```

### `skills/start-task/SKILL.md`

````markdown
---
name: start-task
description: >
  Execute one phase of the PRD Phase Kit implementation plan. Resume-aware: picks the
  in-progress phase or the next todo phase, prints git setup commands and waits
  for confirmation, implements the phase's tasks, runs the testing gate, and
  updates plan.md progress. Does NOT commit or push. Use when the user runs
  /ppk-start-task, says "kerjain phase 2", "start the next phase", or references
  @files:plan.md.
---

# /ppk-start-task — Execute one phase

**Trigger:** `/ppk-start-task @files:plan.md` (optionally `/ppk-start-task phase 2`)

**Goal:** Set up git, implement the chosen phase, and mark progress in `plan.md`.

## Steps

1. Read `plan.md`. **Resume-aware selection:** if the user didn't specify a
   phase, first look for a phase with `status: in-progress` (an interrupted run)
   and resume from the first unchecked task; otherwise pick the first phase whose
   `status` is `todo`. Confirm with the user which phase you're about to run.
2. **Print the git setup commands and WAIT for the user to confirm** before
   running them:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b <type>/<issue>-<slug>   # from the phase's `branch` field
   ```
3. After confirmation, set the phase `status: in-progress` in `plan.md`.
4. Implement the phase's tasks. Tick each task checkbox (`- [x]`) as it completes.
5. **Testing gate (mandatory).** "Tested" means more than unit tests — run the
   project's full quality bar where applicable: **tests + lint + format check +
   typecheck + build**. Either run the checks yourself and report results,
   provide the exact commands for the user to run, or ask: *"Has the code been
   tested (tests/lint/typecheck/build) and is it running cleanly?"* The phase's
   `Check (auto)` command from `plan.md` must exit green. Do NOT proceed to
   `/ppk-finish-task` until everything is green.
6. **Spec drift check.** If the phase revealed the PRD/plan was wrong or
   incomplete, STOP, update `PRD.md`/`plan.md` with the user's confirmation, then
   continue (Global Rule #7).
7. When the phase's tasks + checks pass, update `plan.md`:
   - set the phase `status: done`
   - check the phase box in **Progress Overview** (`- [x] Phase N`)
8. Tell the user the phase is complete and prompt them to run `/ppk-finish-task`.

> `/ppk-start-task` does NOT commit or push. It only sets up the branch, writes code,
> runs tests, and updates the plan's progress.

## Global rules (always apply)

- Wait for confirmation before running git setup.
- Never declare done on red/unknown tests.
- Respond in the user's language.
- See `skills/_shared/conventions.md` for the full rule set.
````

### `skills/status/SKILL.md`

```markdown
---
name: status
description: >
  Show PRD Phase Kit progress. Reads plan.md and prints the Progress Overview plus the
  status of each phase (todo / in-progress / done) so the user sees at a glance
  what's done and what's left. Use when the user runs /ppk-status, /ppk-status,
  or asks "sampai mana progress-nya", "phase mana yang belum".
---

# /ppk-status — Show progress

**Trigger:** `/ppk-status`

Reads `docs/specs/<feature-slug>/plan.md` and prints:
- the **Progress Overview** checklist, and
- each phase's `status` (todo / in-progress / done),

so the user can see at a glance what's done, in progress, and remaining. If
multiple features exist under `docs/specs/`, list them and ask which one (or show
all).

## Global rules (always apply)

- Read-only — never modify files.
- Respond in the user's language.
- See `skills/_shared/conventions.md` for the full rule set.
```

### `templates/PRD.md`

```markdown
# PRD: <Feature Name>

- **Status:** draft
- **Author:** <user>
- **Created:** <YYYY-MM-DD>
- **Feature slug:** <feature-slug>

## 1. Problem / Background
What problem are we solving and why now?

## 2. Goals
- Goal 1
- Goal 2

## 3. Non-Goals (out of scope)
- Non-goal 1

## 4. Target Users / Personas
Who uses this and in what context?

## 5. User Stories
- As a <role>, I want <action> so that <benefit>.

## 6. Functional Requirements
- FR1: ...
- FR2: ...

## 7. Non-Functional Requirements
Performance, security, accessibility, i18n, etc.

## 8. Tech Stack & Decisions
(Confirmed with user — do not invent.)
- Language / framework:
- Database:
- Key libraries:
- Deployment target:

## 9. Open Questions / Assumptions
- Q1 (resolved/open):

## 10. Success Metrics
How do we know it works?
```

### `templates/changelog.md`

```markdown
# Changelog — Phase <N>: <phase name>

- **Feature:** <feature-slug>
- **Phase:** <N>
- **Date:** <YYYY-MM-DD>
- **Branch:** <type>/<issue>-<slug>
- **Commit:** <hash or message>
- **Tested:** yes
- **Tests run:** `<exact command run, e.g. npm test>`
- **Risk:** <Low | Medium | High> — <reason>

## Summary
One or two sentences on what this phase delivered.

## Files Changed

### Added
| File | Purpose |
|------|---------|
| `path/to/new_file.ts` | What it does and why it was created |

### Modified
| File | Lines | What changed & why |
|------|-------|--------------------|
| `path/to/file.ts` | L12–L40 | Added validation; reason |

### Deleted
| File | Reason |
|------|--------|
| `path/to/old_file.ts` | Replaced by new_file.ts |

## Notes / Follow-ups
- Anything deferred to a later phase.
```

### `templates/plan.md`

```markdown
# Implementation Plan: <Feature Name>

- **PRD:** ./PRD.md
- **Feature slug:** <feature-slug>
- **Total phases:** <N>   (proposed by AI, confirmed by user)

## Progress Overview
- [ ] Phase 1 — <name>
- [ ] Phase 2 — <name>
- [ ] Phase 3 — <name>

---

## Phase 1 — <name>
- **status:** todo            # todo | in-progress | done
- **branch:** feat/<issue>-<slug>
- **depends on:** none
- **goal:** <one sentence>

### Tasks
- [ ] 1.1 <task>
- [ ] 1.2 <task>

### Definition of Done (must include >=1 machine-checkable check)
- [ ] Functional: <how we verify this phase behaves correctly>
- [ ] Check (auto): `<exact command that must exit green, e.g. npm test && npm run lint && npm run typecheck>`

### Size note
- Target: reviewable in one PR (~<= 400 changed lines). If larger, split into
  sub-phases.

### Risk
- <Low | Medium | High> — <reason>

---

## Phase 2 — <name>
- **status:** todo
- **branch:** feat/<issue>-<slug>
- **depends on:** Phase 1
- **goal:** ...

### Tasks
- [ ] 2.1 <task>

### Definition of Done (must include >=1 machine-checkable check)
- [ ] Functional: ...
- [ ] Check (auto): `<exact command>`

### Risk
- <Low | Medium | High> — <reason>
```

