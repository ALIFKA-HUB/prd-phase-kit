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