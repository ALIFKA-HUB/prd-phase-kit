# Why Trust This Workflow?

> **Short answer:** Because it forces every human and AI to follow the same
> rules — spec first, tests before commit, one phase at a time.

---

## 1. Spec-Driven, Not Vibe-Driven

Most AI coding sessions start with a vague prompt and end with code that
"mostly works." PRD Phase Kit starts differently:

1. **Write the PRD first** — `/ppk-init-prd` interviews you, not the other
   way around. The AI can't write a single line of code until there's a
   signed-off spec.
2. **Phase the plan** — `/ppk-make-plan` breaks the PRD into small,
   independently shippable phases. No phase is allowed to be "we'll figure
   it out later."
3. **Gate every commit** — `/ppk-finish-task` refuses to commit on failing
   or unknown tests. Red tests → stop. Full stop.

The result: every commit in your history maps to a spec, a phase, and a
passing test suite.

---

## 2. Reproducible Across Any AI Agent

The workflow is installed as native command files — `.toml` for Gemini,
`.md` for Claude/Windsurf/Codex/Cursor. The same rules run on every agent.

- No agent-specific hacks.
- No "well, ChatGPT does it differently."
- One `npm run sync` keeps all five agent formats in lockstep.

Switch agents mid-project? Your PRD, plan, and changelog travel with you.

---

## 3. Auditable by Design

Every phase leaves paper trail:

| Artifact | What it proves |
|---|---|
| `docs/specs/<slug>/PRD.md` | What was agreed before coding |
| `plan.md` | What phases were planned, which are done |
| `docs/changelog/<slug>/phase-NN.md` | What changed, which files, which lines, and why |
| Git branch `feat/phase-NN-<slug>` | Exact diff, squash-merged to main |

You can reconstruct the entire decision history from the repo alone — no
Slack thread archaeology required.

---

## 4. Tiny Phases = Cheap Mistakes

A phase is designed to be completable in one session. If it's bigger than
that, `/ppk-make-plan` splits it. Small phases mean:

- **Short-lived branches** — less merge conflict surface.
- **Fast feedback** — tests run on every phase, not at the end of the
  sprint.
- **Cheap rollback** — one squash commit per phase, trivial to revert.

---

## 5. The AI Can't Skip the Rules

The commands are written as SKILL.md instructions loaded directly into
the agent's context. The agent reads:

> "Never commit on red/unknown tests (Global Rule #2)."

It's not a convention that gets forgotten. It's in the prompt, every time.

---

## Summary

| Concern | How PRD Phase Kit addresses it |
|---|---|
| "Will the AI go rogue?" | Spec-locked + test-gated. Can't commit on red. |
| "Will it work on my agent?" | 5 agents supported, all synced from one source. |
| "Can I audit what changed?" | Full changelog + git history per phase. |
| "What if requirements change?" | Edit the PRD, re-run `/ppk-make-plan`. |
| "What if a phase breaks things?" | One squash commit, `git revert` in 10 seconds. |
