# PRD — Task Manager CLI

**Feature slug:** `task-manager-cli`
**Date:** 2026-06-01
**Author:** Demo User
**Status:** Approved

---

## Problem Statement

Teams using CLI-based workflows have no lightweight task manager that lives in the terminal. Existing tools (Jira, Linear) require a browser, context switching, and authentication. Developers lose focus switching apps to track work.

## Goal

Build a single-binary CLI tool (`tasks`) that lets a developer create, list, and complete tasks — stored in a local `tasks.json` — with zero browser or account required.

## User Stories

1. **Create task** — `tasks add "Write tests for auth module"` → prints task ID
2. **List tasks** — `tasks list` → shows all open tasks with IDs and creation dates
3. **Complete task** — `tasks done <id>` → marks task complete, removes from list
4. **Clear done** — `tasks clear` → deletes all completed tasks
5. **Persistence** — tasks survive terminal restarts (stored in `~/.tasks/tasks.json`)

## Out of Scope (v1)

- Due dates, priorities, tags
- Sync / multi-device
- Team sharing

## Success Criteria

- All 5 user stories work end-to-end
- 80%+ test coverage on core logic
- Binary installs with `npm install -g` or `npx`
- README with quickstart guide

## Tech Decisions

- **Runtime:** Node.js ≥ 18 (no transpile needed, ships with `node --test`)
- **Storage:** JSON file at `~/.tasks/tasks.json` (no DB dependency)
- **CLI parsing:** `process.argv` directly (no deps)
- **Tests:** `node --test` built-in runner

## Constraints

- Zero runtime dependencies (only devDependencies)
- Works on Linux, macOS, Windows
