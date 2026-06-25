# PRD Phase Kit — Improvement Plan (v3)

12 phase. Tiap phase kecil, fokus, independently shippable.

---

## Phase 1 — Fix README.md
**effort:** kecil · **impact:** 🔴 kritis

#### [MODIFY] [README.md](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/README.md)
Sekarang: 7 baris, terpotong mid-sentence. Rewrite:
- Badge row: license (MIT), Node ≥ 18, CI status
- One-liner description
- ASCII flow diagram: `/ppk-init-prd` → `/ppk-make-plan` → `/ppk-start-task` → `/ppk-finish-task`
- Quick install (3 methods: npx, curl, irm)
- Quick reference table (command → input → output → commits?)
- Supported agents list
- Link ke INSTALL.md, CONTRIBUTING.md, LICENSE

### Definition of Done
- [ ] README.md lengkap, ga terpotong
- [ ] Ada flow diagram + install commands + agent list

---

## Phase 2 — Fix INSTALL.md
**effort:** kecil · **impact:** 🔴 kritis

#### [MODIFY] [INSTALL.md](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/INSTALL.md)
Sekarang: 10 baris, berhenti di heading tanpa isi. Lengkapi:
- Quick install per OS (bash `curl`, PowerShell `irm`)
- CLI flags reference: `--all`, `--only`, `--list`, `--dry-run`, `--uninstall`
- Supported agents table (id, label, scope, format)
- Verify: `node bin/install.js --list`
- Troubleshooting: Node version, npx not found, permission errors

### Definition of Done
- [ ] INSTALL.md lengkap, semua flags documented
- [ ] Troubleshooting section ada

---

## Phase 3 — Fix CONTRIBUTING.md
**effort:** kecil · **impact:** 🟡 penting

#### [MODIFY] [CONTRIBUTING.md](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/CONTRIBUTING.md)
Sekarang: 9 baris, terpotong. Lengkapi:
- Single source of truth: edit skill cuma di `skills/<name>/SKILL.md`
- Dev workflow: edit SKILL.md → `npm run sync` → `npm test`
- How to add new skill
- Commit conventions (Conventional Commits)
- PR checklist

### Definition of Done
- [ ] CONTRIBUTING.md lengkap, dev workflow jelas

---

## Phase 4 — Fix CRLF Bug
**effort:** kecil · **impact:** 🔴 kritis

`parseSkill()` regex `^---\n` ga match `---\r\n`. Windows users kena.

#### [MODIFY] [skills.js](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/bin/lib/skills.js)
- Normalize CRLF: `raw = raw.replace(/\r\n/g, '\n')` di awal `parseSkill()`

#### [MODIFY] [sync.js](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/scripts/sync.js)
- Same fix di local `parseSkill()` (akan di-dedup di Phase 5)

### Definition of Done
- [ ] CRLF file parse correctly
- [ ] Check (auto): `npm test`

---

## Phase 5 — Deduplicate Code
**effort:** kecil · **impact:** 🟡 penting

`parseSkill()`, `tomlLiteral()`, `shortDescription()` duplikat di `sync.js` dan `bin/lib/`.

#### [MODIFY] [sync.js](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/scripts/sync.js)
- Hapus local `parseSkill()` (L35-L57) — import dari `../bin/lib/skills.js`
- Hapus local `tomlLiteral()` (L66-L72) + `shortDescription()` (L59-L64) — import dari `../bin/lib/providers.js`
- Hapus local `listSkills()` — pakai `loadSkills()` dari skills.js
- sync.js jadi thin wrapper: load skills → build output → write/check

### Definition of Done
- [ ] sync.js ga punya fungsi yg di-copy dari bin/lib/
- [ ] Check (auto): `npm test && npm run sync:check`

---

## Phase 6 — Error Handling
**effort:** kecil · **impact:** 🟡 penting

Crash tanpa pesan helpful kalau file corrupt atau permission denied.

#### [MODIFY] [skills.js](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/bin/lib/skills.js)
- `parseSkill()`: warn kalau frontmatter kosong atau missing `name`/`description`
- `loadSkills()`: try/catch di `readFileSync`, log skill name + error

#### [MODIFY] [sync.js](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/scripts/sync.js)
- try/catch di file writes, pesan error helpful
- Validasi SKILL.md punya required fields — warn kalau missing
- Proper exit code on error

#### [MODIFY] [install.js](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/bin/install.js)
- Wrap `fs.writeFileSync` / `fs.unlinkSync` dalam try/catch
- Pesan: "Permission denied writing to X — try running as admin"

### Definition of Done
- [ ] Corrupt SKILL.md → helpful error, bukan crash
- [ ] Permission denied saat install → helpful error
- [ ] Check (auto): `npm test`

---

## Phase 7 — Test: parseSkill Edge Cases
**effort:** kecil · **impact:** 🟡 penting

#### [NEW] `tests/parseSkill.test.mjs`
- Missing frontmatter (no `---`) → return body as-is
- Empty body → body = `""`
- Broken YAML (missing value) → skip bad keys, ga crash
- CRLF vs LF → same result
- `'''` in body → `tomlLiteral()` throws
- Folded (`>`) dan literal (`|`) block scalars

### Definition of Done
- [ ] Semua edge case tests pass
- [ ] Check (auto): `npm test`

---

## Phase 8 — Test: Installer CLI
**effort:** kecil · **impact:** 🟡 penting

#### [NEW] `tests/install.test.mjs`
Test CLI behavior (pake `execFileSync` atau temp dir):
- `--help` → output contains "Usage"
- `--list` → output contains all 5 provider IDs
- `--dry-run` → ga create files
- `--only invalid-agent` → exit code 1
- No agents detected, no flags → "no agents" message

### Definition of Done
- [ ] CLI flag tests pass
- [ ] Check (auto): `npm test`

---

## Phase 9 — Test: Sync & Skills Expanded
**effort:** kecil · **impact:** 🟢 nice

#### [MODIFY] [sync.test.mjs](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/tests/sync.test.mjs)
- Output file count = skill count (5 toml files + plugin mirrors)

#### [MODIFY] [skills.test.mjs](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/tests/skills.test.mjs)
- `command` field format = `ppk-<name>` for all skills
- Description ga ada double spaces (whitespace collapse works)
- Description ga ada leading/trailing whitespace

### Definition of Done
- [ ] New assertions pass
- [ ] Check (auto): `npm test`

---

## Phase 10 — New Command: `/ppk-reset`
**effort:** sedang · **impact:** 🟢 nice

#### [NEW] `skills/reset/SKILL.md`
- **Trigger:** `/ppk-reset phase 3` atau `/ppk-reset` (interactive)
- **Steps:**
  1. Read `plan.md`, list phases `done` / `in-progress`
  2. User pilih phase (atau terima argument)
  3. Confirm — destructive action, tulis full sentence
  4. Set `status: todo`
  5. Uncheck task checkboxes (`[x]` → `[ ]`)
  6. Uncheck progress overview checkbox
  7. Support `/ppk-reset all` buat reset semua
- Ga hapus code/changelog — cuma reset plan.md state

#### Post-create:
- `npm run sync` → generate `commands/ppk-reset.toml` + plugin mirror
- Update test: `loadSkills()` expect 6 skills (was 5)

### Definition of Done
- [ ] SKILL.md ada dan well-structured
- [ ] `npm run sync` generate ppk-reset.toml
- [ ] Test updated: 6 commands
- [ ] Check (auto): `npm test && npm run sync:check`

---

## Phase 11 — CHANGELOG.md & Package Metadata
**effort:** kecil · **impact:** 🟢 nice

#### [NEW] `CHANGELOG.md`
- Format: [Keep a Changelog](https://keepachangelog.com/)
- v0.1.0 initial release entry

#### [MODIFY] [package.json](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/package.json)
- Tambah `"keywords"`: `["prd", "spec-driven", "ai-agent", "workflow", "slash-commands", "gemini", "claude", "cursor", "windsurf", "codex"]`
- Tambah `"type": "commonjs"` (explicit)

### Definition of Done
- [ ] CHANGELOG.md ada, v0.1.0 entry
- [ ] package.json punya keywords
- [ ] Check (auto): `npm test`

---

## Phase 12 — Gitignore Cleanup & Example Outputs
**effort:** kecil · **impact:** 🟢 nice

#### [MODIFY] [.gitignore](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/.gitignore)
- Draft files (`skills.md`, `0*.md`, `full-chat-log.md`, `scaffold.js`) di-gitignore tapi masih tracked
- Remove dari tracking: `git rm --cached skills.md full-chat-log.md scaffold.js 00-instructions.md 01-structure.md 02-skills-and-templates.md 03-installer-and-scripts.md 04-manifests-and-docs.md`

#### [NEW] `examples/demo-output/PRD.md`
- Sample PRD lengkap (realistic, bukan lorem ipsum)

#### [NEW] `examples/demo-output/plan.md`
- Sample plan 3 phases, mix status (done/in-progress/todo)

#### [NEW] `examples/demo-output/phase-01.md`
- Sample changelog entry

### Definition of Done
- [ ] Draft files untracked
- [ ] Example outputs ada dan realistis
- [ ] Check (auto): `npm test && npm run sync:check`

---

## Verification Plan (All Phases)

```bash
npm test              # all tests pass
npm run sync:check    # generated artifacts in sync
node bin/install.js --list   # smoke check
```

---

## Summary

| Phase | Scope | Effort | Impact |
|-------|-------|--------|--------|
| 1 | Fix README.md | Kecil | 🔴 Kritis |
| 2 | Fix INSTALL.md | Kecil | 🔴 Kritis |
| 3 | Fix CONTRIBUTING.md | Kecil | 🟡 Penting |
| 4 | Fix CRLF bug | Kecil | 🔴 Kritis |
| 5 | Deduplicate code | Kecil | 🟡 Penting |
| 6 | Error handling | Kecil | 🟡 Penting |
| 7 | Test: parseSkill | Kecil | 🟡 Penting |
| 8 | Test: installer CLI | Kecil | 🟡 Penting |
| 9 | Test: sync & skills | Kecil | 🟢 Nice |
| 10 | `/ppk-reset` command | Sedang | 🟢 Nice |
| 11 | CHANGELOG + package.json | Kecil | 🟢 Nice |
| 12 | Gitignore cleanup + examples | Kecil | 🟢 Nice |
