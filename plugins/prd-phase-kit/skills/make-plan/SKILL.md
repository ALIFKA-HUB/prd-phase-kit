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