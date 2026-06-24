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