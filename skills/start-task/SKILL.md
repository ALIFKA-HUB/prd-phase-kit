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