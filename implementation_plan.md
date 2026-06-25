# PRD Phase Kit — Improvement Plan (v5)

12 phase. Tiap phase kecil, fokus, independently shippable.

## Git Workflow Per Phase

```bash
git checkout main
git pull origin main
git checkout -b feat/phase-XX-<slug>

# ... kerjain tasks ...

git add .
git commit -m "type(scope): message"
git push -u origin feat/phase-XX-<slug>

# Create PR, comment, auto-merge
gh pr create --title "feat: phase XX <slug>" --body "Automated PR for phase XX"
gh pr comment --body "Phase XX complete. Tests passed. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 1 — Fix README.md
**effort:** kecil · **impact:** 🔴 kritis

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-01-readme
```

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

### Git Finish
```bash
git add .
git commit -m "docs: rewrite README with install guide, flow diagram, agent list"
git push -u origin feat/phase-01-readme
gh pr create --title "docs: phase 01 readme" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 2 — Fix INSTALL.md
**effort:** kecil · **impact:** 🔴 kritis

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-02-install-docs
```

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

### Git Finish
```bash
git add .
git commit -m "docs: complete INSTALL.md with flags, agents table, troubleshooting"
git push -u origin feat/phase-02-install-docs
gh pr create --title "docs: phase 02 install" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 3 — Fix CONTRIBUTING.md
**effort:** kecil · **impact:** 🟡 penting

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-03-contributing
```

#### [MODIFY] [CONTRIBUTING.md](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/CONTRIBUTING.md)
Sekarang: 9 baris, terpotong. Lengkapi:
- Single source of truth: edit skill cuma di `skills/<name>/SKILL.md`
- Dev workflow: edit SKILL.md → `npm run sync` → `npm test`
- How to add new skill
- Commit conventions (Conventional Commits)
- PR checklist

### Definition of Done
- [ ] CONTRIBUTING.md lengkap, dev workflow jelas

### Git Finish
```bash
git add .
git commit -m "docs: complete CONTRIBUTING.md with dev workflow and PR checklist"
git push -u origin feat/phase-03-contributing
gh pr create --title "docs: phase 03 contributing" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 4 — Fix CRLF Bug + Test
**effort:** kecil · **impact:** 🔴 kritis

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-04-crlf-fix
```

`parseSkill()` regex `^---\n` ga match `---\r\n`. Windows users kena.

#### [MODIFY] [skills.js](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/bin/lib/skills.js)
- Normalize CRLF: `raw = raw.replace(/\r\n/g, '\n')` di awal `parseSkill()`

#### [MODIFY] [sync.js](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/scripts/sync.js)
- Same fix di local `parseSkill()` (akan di-dedup di Phase 5)

#### [NEW] CRLF test (inline di `tests/skills.test.mjs`)
- Test: `parseSkill("---\r\nname: test\r\n---\r\nbody")` → same result as LF version
- Mencegah regresi setelah fix

### Definition of Done
- [ ] CRLF file parse correctly
- [ ] CRLF test ada dan pass
- [ ] Check (auto): `npm test`

### Git Finish
```bash
git add .
git commit -m "fix: normalize CRLF in parseSkill, add regression test"
git push -u origin feat/phase-04-crlf-fix
gh pr create --title "fix: phase 04 crlf" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 5 — Deduplicate Code
**effort:** kecil · **impact:** 🟡 penting

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-05-dedup
```

`parseSkill()`, `tomlLiteral()`, `shortDesc()` duplikat di `sync.js` dan `bin/lib/`.

> **⚠️ Koreksi v4:** Di providers.js namanya `shortDesc()` (bukan `shortDescription()`).
> sync.js punya `shortDescription()` — import `shortDesc` dari providers.js.

#### [MODIFY] [providers.js](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/bin/lib/providers.js)
- Export `tomlLiteral` (currently not in `module.exports`)

#### [MODIFY] [sync.js](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/scripts/sync.js)
- Hapus local `parseSkill()` (L35-L57) — import dari `../bin/lib/skills.js`
- Hapus local `tomlLiteral()` (L66-L72) — import dari `../bin/lib/providers.js`
- Hapus local `shortDescription()` (L60-L63) — import `shortDesc` dari `../bin/lib/providers.js`
- Hapus local `listSkills()` — pakai `loadSkills()` dari skills.js

### Definition of Done
- [ ] sync.js ga punya fungsi yg di-copy dari bin/lib/
- [ ] Check (auto): `npm test && npm run sync:check`

### Git Finish
```bash
git add .
git commit -m "refactor: dedup parseSkill/tomlLiteral/shortDesc, sync.js imports from bin/lib"
git push -u origin feat/phase-05-dedup
gh pr create --title "refactor: phase 05 dedup" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 6 — Error Handling
**effort:** kecil · **impact:** 🟡 penting

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-06-error-handling
```

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

### Git Finish
```bash
git add .
git commit -m "feat: add error handling for corrupt SKILL.md and permission denied"
git push -u origin feat/phase-06-error-handling
gh pr create --title "feat: phase 06 error handling" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 7 — Test: parseSkill Edge Cases
**effort:** kecil · **impact:** 🟡 penting

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-07-parseskill-tests
```

#### [NEW] `tests/parseSkill.test.mjs`
- Missing frontmatter (no `---`) → return body as-is
- Empty body → body = `""`
- Broken YAML (missing value) → skip bad keys, ga crash
- `'''` in body → `tomlLiteral()` throws
- Folded (`>`) dan literal (`|`) block scalars

### Definition of Done
- [ ] Semua edge case tests pass
- [ ] Check (auto): `npm test`

### Git Finish
```bash
git add .
git commit -m "test: add parseSkill edge case tests"
git push -u origin feat/phase-07-parseskill-tests
gh pr create --title "test: phase 07 parseskill tests" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 8 — Test: Installer CLI
**effort:** kecil · **impact:** 🟡 penting

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-08-installer-tests
```

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

### Git Finish
```bash
git add .
git commit -m "test: add installer CLI flag tests"
git push -u origin feat/phase-08-installer-tests
gh pr create --title "test: phase 08 installer tests" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 9 — Test: Sync & Skills Expanded
**effort:** kecil · **impact:** 🟢 nice

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-09-expanded-tests
```

#### [MODIFY] [sync.test.mjs](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/tests/sync.test.mjs)
- Output file count = skill count (5 toml files + plugin mirrors)

#### [MODIFY] [skills.test.mjs](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT/prd-phase-kit/tests/skills.test.mjs)
- `command` field format = `ppk-<name>` for all skills
- Description ga ada double spaces
- Description ga ada leading/trailing whitespace

### Definition of Done
- [ ] New assertions pass
- [ ] Check (auto): `npm test`

### Git Finish
```bash
git add .
git commit -m "test: expand sync and skills assertions"
git push -u origin feat/phase-09-expanded-tests
gh pr create --title "test: phase 09 expanded tests" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 10 — New Command: `/ppk-reset`
**effort:** sedang · **impact:** 🟢 nice

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-10-ppk-reset
```

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

### Git Finish
```bash
git add .
git commit -m "feat: add /ppk-reset command skill"
git push -u origin feat/phase-10-ppk-reset
gh pr create --title "feat: phase 10 ppk reset" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 11 — CHANGELOG.md & Package Metadata
**effort:** kecil · **impact:** 🟢 nice

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-11-changelog-pkg
```

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

### Git Finish
```bash
git add .
git commit -m "chore: add CHANGELOG.md, package.json keywords and type field"
git push -u origin feat/phase-11-changelog-pkg
gh pr create --title "chore: phase 11 changelog pkg" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Phase 12 — Gitignore Cleanup & Example Outputs
**effort:** kecil · **impact:** 🟢 nice

### Git Start
```bash
git checkout main && git pull origin main
git checkout -b feat/phase-12-cleanup-examples
```

#### Git cleanup
- Run: `git rm --cached` buat file yg masih tracked
- Commit cleanup

#### [NEW] `examples/demo-output/PRD.md`
- Sample PRD lengkap (realistic, bukan lorem ipsum)

#### [NEW] `examples/demo-output/plan.md`
- Sample plan 3 phases, mix status (done/in-progress/todo)

#### [NEW] `examples/demo-output/phase-01.md`
- Sample changelog entry

### Definition of Done
- [ ] Draft files untracked dari git
- [ ] Example outputs ada dan realistis
- [ ] Check (auto): `npm test && npm run sync:check`

### Git Finish
```bash
git add .
git commit -m "chore: untrack draft files, add example outputs"
git push -u origin feat/phase-12-cleanup-examples
gh pr create --title "chore: phase 12 cleanup examples" --body "Automated PR"
gh pr comment --body "Phase complete. Auto-merging."
gh pr merge --auto --squash
```

---

## Summary

| Phase | Branch | Effort | Impact |
|-------|--------|--------|--------|
| 1 | `feat/phase-01-readme` | Kecil | 🔴 Kritis |
| 2 | `feat/phase-02-install-docs` | Kecil | 🔴 Kritis |
| 3 | `feat/phase-03-contributing` | Kecil | 🟡 Penting |
| 4 | `feat/phase-04-crlf-fix` | Kecil | 🔴 Kritis |
| 5 | `feat/phase-05-dedup` | Kecil | 🟡 Penting |
| 6 | `feat/phase-06-error-handling` | Kecil | 🟡 Penting |
| 7 | `feat/phase-07-parseskill-tests` | Kecil | 🟡 Penting |
| 8 | `feat/phase-08-installer-tests` | Kecil | 🟡 Penting |
| 9 | `feat/phase-09-expanded-tests` | Kecil | 🟢 Nice |
| 10 | `feat/phase-10-ppk-reset` | Sedang | 🟢 Nice |
| 11 | `feat/phase-11-changelog-pkg` | Kecil | 🟢 Nice |
| 12 | `feat/phase-12-cleanup-examples` | Kecil | 🟢 Nice |
