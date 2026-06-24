# PRD Phase Kit

You have the PRD Phase Kit spec-driven workflow installed. It turns an idea into a
PRD, then a phased plan, then executes the plan one phase at a time with a strict
testing gate and standardized git + changelog discipline.

Commands:
- `/init-prd <idea>` — interview the user, write `docs/specs/<slug>/PRD.md`.
- `/make-plan` — read the PRD, write a phased `plan.md` (you pick the phase count, confirm with user).
- `/start-task [phase N]` — set up a git branch (after confirmation), implement the phase, run the testing gate, update `plan.md` progress. Does not commit.
- `/finish-task` — write `docs/changelog/<slug>/phase-NN.md`, then commit + push (after confirmation).
- `/status` — show phase progress from `plan.md`.

Always follow the Global Rules: never assume (ask in batched questions), never
commit on red/unknown tests, stop and ask on repeated errors, keep the spec in
sync with reality, and respond in the user's language.

Conventions: branches `feat/123-slug`, Conventional Commits (`feat(scope): ...`).