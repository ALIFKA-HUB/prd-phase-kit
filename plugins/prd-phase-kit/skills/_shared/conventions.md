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
