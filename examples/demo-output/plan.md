# Plan — Task Manager CLI

**Feature:** `task-manager-cli`
**PRD:** `docs/specs/task-manager-cli/PRD.md`
**Created:** 2026-06-01

## Progress Overview

- [x] Phase 1 — Project scaffold + storage module
- [x] Phase 2 — `tasks add` and `tasks list`
- [/] Phase 3 — `tasks done` and `tasks clear`
- [ ] Phase 4 — Tests (80% coverage gate)
- [ ] Phase 5 — README + publish to npm

---

## Phase 1 — Project scaffold + storage module
**status:** done
**branch:** `feat/task-manager-phase-01-scaffold`
**effort:** small

### Tasks
- [x] Init `package.json` (zero deps, `"type": "commonjs"`, `"bin"`)
- [x] Create `src/storage.js` — `load()` and `save()` for `~/.tasks/tasks.json`
- [x] Create `src/ids.js` — generate short unique IDs
- [x] Smoke test: `node src/storage.js` round-trips correctly

### Changelog
`docs/changelog/task-manager-cli/phase-01.md`

---

## Phase 2 — `tasks add` and `tasks list`
**status:** done
**branch:** `feat/task-manager-phase-02-add-list`
**effort:** small

### Tasks
- [x] Create `bin/tasks.js` entry point with `parseArgs()`
- [x] Implement `add <title>` — appends to storage, prints ID
- [x] Implement `list` — prints open tasks as numbered table
- [x] Manual smoke test: add 3 tasks, list them

### Changelog
`docs/changelog/task-manager-cli/phase-02.md`

---

## Phase 3 — `tasks done` and `tasks clear`
**status:** in-progress
**branch:** `feat/task-manager-phase-03-done-clear`
**effort:** small

### Tasks
- [x] Implement `done <id>` — marks task complete, confirms to user
- [ ] Implement `clear` — removes all completed tasks with count printed
- [ ] Manual smoke test: full add → list → done → clear workflow

---

## Phase 4 — Tests (80% coverage gate)
**status:** todo
**effort:** medium

### Tasks
- [ ] `tests/storage.test.mjs` — load/save round-trip, missing file, corrupt file
- [ ] `tests/ids.test.mjs` — uniqueness, length, character set
- [ ] `tests/cli.test.mjs` — all commands via `execFileSync`, exit codes
- [ ] Run `node --test --experimental-test-coverage`, fail if < 80%

---

## Phase 5 — README + publish to npm
**status:** todo
**effort:** small

### Tasks
- [ ] Write README: quickstart, all commands, examples
- [ ] `npm publish --dry-run` — verify package contents
- [ ] Tag `v1.0.0` and push
