# Changelog — Phase 01: Project scaffold + storage module

**Feature:** `task-manager-cli`
**Phase:** 01
**Branch:** `feat/task-manager-phase-01-scaffold`
**Date:** 2026-06-01
**Status:** ✅ Done

---

## What was done

Bootstrapped the project with zero runtime dependencies and implemented the storage layer.

### Files created

| File | Purpose |
|------|---------|
| `package.json` | Zero-dep package, `"bin": { "tasks": "./bin/tasks.js" }` |
| `src/storage.js` | `load()` reads `~/.tasks/tasks.json`, `save()` writes atomically |
| `src/ids.js` | `generateId()` — 6-char base-36 ID from timestamp + random |

### Key decisions

- **No dependencies.** `fs.writeFileSync` with a `.tmp` → rename pattern for atomic writes — avoids data loss if the process crashes mid-write.
- **Storage location** `~/.tasks/tasks.json` (user home, not project dir) so tasks are global across projects.
- **ID format** `t_<6chars>` — short enough to type, long enough to avoid collisions for personal use.

---

## Tests

No automated tests this phase (storage is smoke-tested manually). Tests added in Phase 4.

**Manual smoke test:**
```
node -e "const s = require('./src/storage'); s.save([{id:'t_abc123', title:'hello', done:false}]); console.log(s.load());"
# Output: [ { id: 't_abc123', title: 'hello', done: false } ]
```

---

## Commit

```
feat(scaffold): init package, storage module, ID generator
```

`feat/task-manager-phase-01-scaffold` → merged to `main` via PR #1
