# prd-phase-kit — Installer, Sync & Tests

The installer detects AI agents and writes the slash-commands into each one. `scripts/sync.js` regenerates `commands/` (Gemini/Codex TOML) and `plugins/prd-phase-kit/` (Claude mirror) from `skills/`. Tests cover skill loading, per-agent rendering, and artifact sync.

> Create each file below at the exact path shown (relative to the repo root). Copy the contents verbatim.

### `bin/install.js`

```js
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { loadSkills } = require('./lib/skills');
const { PROVIDERS, getProvider, context } = require('./lib/providers');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const opts = { only: null, all: false, list: false, dryRun: false, uninstall: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') opts.all = true;
    else if (a === '--list') opts.list = true;
    else if (a === '--dry-run' || a === '-n') opts.dryRun = true;
    else if (a === '--uninstall' || a === '--remove') opts.uninstall = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--only') opts.only = (argv[++i] || '').split(',').filter(Boolean);
    else if (a.startsWith('--only=')) opts.only = a.slice('--only='.length).split(',').filter(Boolean);
  }
  return opts;
}

function chooseProviders(opts, ctx) {
  if (opts.only) {
    const chosen = opts.only.map(getProvider);
    const bad = opts.only.filter((id) => !getProvider(id));
    if (bad.length) {
      console.error(`Unknown agent(s): ${bad.join(', ')}`);
      console.error(`Known: ${PROVIDERS.map((p) => p.id).join(', ')}`);
      process.exit(1);
    }
    return chosen;
  }
  if (opts.all) return PROVIDERS;
  return PROVIDERS.filter((p) => p.detect(ctx));
}

function printHelp() {
  console.log(`PRD Phase Kit installer — spec-driven workflow slash-commands

Usage:
  npx github:ALIFKA-HUB/prd-phase-kit [options]

Options:
  --all              Install for every supported agent (even if not detected)
  --only <a,b>       Install only for the named agents
  --list             List supported agents and detection status, then exit
  --dry-run, -n      Show what would be written without writing
  --uninstall        Remove previously installed PRD Phase Kit commands
  -h, --help         Show this help

Supported agents:
${PROVIDERS.map((p) => `  ${p.id.padEnd(10)} ${p.label} (${p.scope} scope)`).join('\n')}`);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) return printHelp();

  const ctx = context();

  if (opts.list) {
    console.log('Supported agents:');
    for (const p of PROVIDERS) {
      const mark = p.detect(ctx) ? 'detected' : 'not detected';
      console.log(`  ${p.id.padEnd(10)} ${p.label.padEnd(14)} ${p.scope.padEnd(8)} [${mark}]`);
    }
    return;
  }

  const skills = loadSkills(ROOT);
  const providers = chooseProviders(opts, ctx);

  if (!providers.length) {
    console.log('No supported AI agents detected.');
    console.log('Use `--all` to install for every agent, or `--only <agent>` to pick one.');
    console.log('Run `--list` to see options.');
    return;
  }

  let count = 0;
  for (const p of providers) {
    const dir = p.dir(ctx);
    console.log(`\n${p.label} (${p.scope}) -> ${dir}`);
    if (!opts.dryRun && !opts.uninstall) fs.mkdirSync(dir, { recursive: true });
    for (const skill of skills) {
      const { filename } = p.file(skill);
      const dest = path.join(dir, filename);
      if (opts.uninstall) {
        if (fs.existsSync(dest)) {
          if (!opts.dryRun) fs.unlinkSync(dest);
          console.log(`  removed  /${skill.command}  (${filename})`);
          count++;
        }
        continue;
      }
      const { content } = p.file(skill);
      if (!opts.dryRun) fs.writeFileSync(dest, content);
      console.log(`  ${opts.dryRun ? 'would write' : 'installed'}  /${skill.command}  (${filename})`);
      count++;
    }
  }

  console.log(
    `\n${opts.uninstall ? 'Removed' : opts.dryRun ? 'Would install' : 'Installed'} ${count} command file(s) across ${providers.length} agent(s).`
  );
  if (!opts.uninstall && !opts.dryRun) {
    console.log('Restart your agent (or reload commands) to pick up the new /ppk-* commands.');
  }
}

main();
```

### `bin/lib/providers.js`

```js
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function tomlLiteral(value) {
  if (value.includes("'''")) throw new Error("body contains ''' — cannot emit TOML literal");
  return "'''\n" + value + "\n'''";
}

function tomlCommand(skill) {
  return (
    `# PRD Phase Kit command — installed from skills/${skill.name}/SKILL.md\n` +
    `description = ${JSON.stringify(shortDesc(skill.description))}\n` +
    `prompt = ${tomlLiteral(skill.body)}\n`
  );
}

function shortDesc(desc) {
  return desc.split(/(?<=[.!?])\s/)[0].replace(/\s+/g, ' ').trim();
}

function markdownCommand(skill, { withFrontmatter }) {
  if (!withFrontmatter) return skill.body + '\n';
  return `---\ndescription: ${JSON.stringify(shortDesc(skill.description))}\n---\n\n${skill.body}\n`;
}

/**
 * Each provider knows where its agent stores custom slash-commands and how to
 * render a skill into that agent's file format.
 *
 * scope:  'user'    -> installs into the home dir (available everywhere)
 *         'project' -> installs into the current repo (committed with the project)
 */
const PROVIDERS = [
  {
    id: 'gemini',
    label: 'Gemini CLI',
    scope: 'user',
    dir: ({ home }) => path.join(home, '.gemini', 'commands'),
    detect: ({ home }) => fs.existsSync(path.join(home, '.gemini')),
    file: (skill) => ({ filename: `${skill.command}.toml`, content: tomlCommand(skill) }),
  },
  {
    id: 'claude',
    label: 'Claude Code',
    scope: 'user',
    dir: ({ home }) => path.join(home, '.claude', 'commands'),
    detect: ({ home }) => fs.existsSync(path.join(home, '.claude')),
    file: (skill) => ({
      filename: `${skill.command}.md`,
      content: markdownCommand(skill, { withFrontmatter: true }),
    }),
  },
  {
    id: 'codex',
    label: 'Codex CLI',
    scope: 'user',
    dir: ({ home }) => path.join(home, '.codex', 'prompts'),
    detect: ({ home }) => fs.existsSync(path.join(home, '.codex')),
    file: (skill) => ({
      filename: `${skill.command}.md`,
      content: markdownCommand(skill, { withFrontmatter: false }),
    }),
  },
  {
    id: 'cursor',
    label: 'Cursor',
    scope: 'project',
    dir: ({ cwd }) => path.join(cwd, '.cursor', 'commands'),
    detect: ({ home, cwd }) =>
      fs.existsSync(path.join(home, '.cursor')) || fs.existsSync(path.join(cwd, '.cursor')),
    file: (skill) => ({
      filename: `${skill.command}.md`,
      content: markdownCommand(skill, { withFrontmatter: false }),
    }),
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    scope: 'project',
    dir: ({ cwd }) => path.join(cwd, '.windsurf', 'workflows'),
    detect: ({ home, cwd }) =>
      fs.existsSync(path.join(home, '.codeium')) ||
      fs.existsSync(path.join(home, '.windsurf')) ||
      fs.existsSync(path.join(cwd, '.windsurf')),
    file: (skill) => ({
      filename: `${skill.command}.md`,
      content: markdownCommand(skill, { withFrontmatter: true }),
    }),
  },
];

function context(overrides = {}) {
  return { home: os.homedir(), cwd: process.cwd(), ...overrides };
}

function getProvider(id) {
  return PROVIDERS.find((p) => p.id === id);
}

module.exports = { PROVIDERS, getProvider, context, markdownCommand, tomlCommand, shortDesc };
```

### `bin/lib/skills.js`

```js
'use strict';

const fs = require('fs');
const path = require('path');

/** Parse a SKILL.md into { frontmatter, body }. Minimal YAML (key: value, folded >). */
function parseSkill(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: raw.trim() };
  const fm = {};
  const lines = m[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let val = kv[2];
    if (val === '>' || val === '|') {
      const folded = [];
      while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) {
        folded.push(lines[++i].trim());
      }
      val = folded.join(' ');
    }
    fm[kv[1]] = val.trim();
  }
  return { frontmatter: fm, body: m[2].trim() };
}

/** Load all skills from a repo root's skills/ dir (excludes _shared). */
function loadSkills(rootDir) {
  const skillsDir = path.join(rootDir, 'skills');
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== '_shared')
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(skillsDir, name, 'SKILL.md')))
    .sort()
    .map((name) => {
      const raw = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8');
      const { frontmatter, body } = parseSkill(raw);
      return {
        name,
        command: `ppk-${name}`,
        description: (frontmatter.description || `PRD Phase Kit ${name}`).replace(/\s+/g, ' ').trim(),
        body,
      };
    });
}

module.exports = { parseSkill, loadSkills };
```

### `install.ps1`

```powershell
# PRD Phase Kit installer shim (Windows PowerShell) — runs the Node installer via npx.
#   irm https://raw.githubusercontent.com/ALIFKA-HUB/prd-phase-kit/main/install.ps1 | iex
$ErrorActionPreference = 'Stop'

$repo = 'github:ALIFKA-HUB/prd-phase-kit'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error 'PRD Phase Kit needs Node.js >= 18. Install it from https://nodejs.org and retry.'
  exit 1
}
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Error 'npx not found. Install Node.js (which ships npx) from https://nodejs.org.'
  exit 1
}

npx -y $repo @args
```

### `install.sh`

```bash
#!/usr/bin/env bash
# PRD Phase Kit installer shim — runs the Node installer via npx (no clone needed).
#   curl -fsSL https://raw.githubusercontent.com/ALIFKA-HUB/prd-phase-kit/main/install.sh | bash
# Pass installer flags through:  ... | bash -s -- --all
set -euo pipefail

REPO="github:ALIFKA-HUB/prd-phase-kit"

if ! command -v node >/dev/null 2>&1; then
  echo "PRD Phase Kit needs Node.js >= 18. Install it from https://nodejs.org and retry." >&2
  exit 1
fi

if command -v npx >/dev/null 2>&1; then
  exec npx -y "$REPO" "$@"
fi

echo "npx not found. Install Node.js (which ships npx) from https://nodejs.org." >&2
exit 1
```

### `scripts/sync.js`

```js
#!/usr/bin/env node
// Sync generated artifacts from the single source of truth (skills/*/SKILL.md).
//
// Generates:
//   commands/ppk-<name>.toml         (Gemini CLI / Codex command stubs)
//   plugins/prd-phase-kit/skills/**            (Claude Code plugin mirror)
//
// Usage:
//   node scripts/sync.js          # write artifacts
//   node scripts/sync.js --check  # fail (exit 1) if artifacts are out of date

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const COMMANDS_DIR = path.join(ROOT, 'commands');
const PLUGIN_SKILLS_DIR = path.join(ROOT, 'plugins', 'prd-phase-kit', 'skills');

const CHECK = process.argv.includes('--check');

/** List skill directories (each containing a SKILL.md), excluding shared. */
function listSkills() {
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== '_shared')
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(SKILLS_DIR, name, 'SKILL.md')))
    .sort();
}

/** Split a SKILL.md into { frontmatter, body }. */
function parseSkill(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: raw.trim() };
  const fm = {};
  // Minimal YAML: only `key: value` and folded `key: >` blocks are needed here.
  const lines = m[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2];
    if (val === '>' || val === '|') {
      const folded = [];
      while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) {
        folded.push(lines[++i].trim());
      }
      val = folded.join(' ');
    }
    fm[key] = val.trim();
  }
  return { frontmatter: fm, body: m[2].trim() };
}

/** First sentence of the description, for a short command summary. */
function shortDescription(desc, fallback) {
  if (!desc) return fallback;
  const firstSentence = desc.split(/(?<=[.!?])\s/)[0];
  return firstSentence.replace(/\s+/g, ' ').trim();
}

function tomlLiteral(value) {
  // TOML multi-line literal string: no escaping, must not contain '''.
  if (value.includes("'''")) {
    throw new Error("SKILL body contains ''' which breaks TOML literal strings");
  }
  return "'''\n" + value + "\n'''";
}

function buildToml(name, frontmatter, body) {
  const desc = shortDescription(frontmatter.description, `PRD Phase Kit ${name}`);
  const prompt = body + '\n\nFollow skills/_shared/conventions.md for the full rule set.';
  return (
    `# AUTO-GENERATED by scripts/sync.js from skills/${name}/SKILL.md — do not edit.\n` +
    `description = ${JSON.stringify(desc)}\n` +
    `prompt = ${tomlLiteral(prompt)}\n`
  );
}

const planned = []; // { file, content }

for (const name of listSkills()) {
  const skillPath = path.join(SKILLS_DIR, name, 'SKILL.md');
  const raw = fs.readFileSync(skillPath, 'utf8');
  const { frontmatter, body } = parseSkill(raw);

  planned.push({
    file: path.join(COMMANDS_DIR, `ppk-${name}.toml`),
    content: buildToml(name, frontmatter, body),
  });

  // Mirror the whole skill directory into the Claude plugin distribution.
  const srcDir = path.join(SKILLS_DIR, name);
  for (const entry of fs.readdirSync(srcDir)) {
    planned.push({
      file: path.join(PLUGIN_SKILLS_DIR, name, entry),
      content: fs.readFileSync(path.join(srcDir, entry), 'utf8'),
    });
  }
}

// Mirror shared conventions too so plugin references resolve.
planned.push({
  file: path.join(PLUGIN_SKILLS_DIR, '_shared', 'conventions.md'),
  content: fs.readFileSync(path.join(SKILLS_DIR, '_shared', 'conventions.md'), 'utf8'),
});

let stale = 0;
for (const { file, content } of planned) {
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (current === content) continue;
  stale++;
  if (CHECK) {
    console.error(`out of date: ${path.relative(ROOT, file)}`);
  } else {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
    console.log(`wrote ${path.relative(ROOT, file)}`);
  }
}

if (CHECK && stale > 0) {
  console.error(`\n${stale} file(s) out of date. Run: npm run sync`);
  process.exit(1);
}
if (!CHECK) {
  console.log(stale === 0 ? 'already in sync' : `synced ${stale} file(s)`);
}
```

### `tests/providers.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { loadSkills } = require('../bin/lib/skills.js');
const { PROVIDERS, getProvider, context } = require('../bin/lib/providers.js');

const skills = loadSkills(ROOT);

test('every provider renders a file for every skill', () => {
  for (const p of PROVIDERS) {
    for (const skill of skills) {
      const { filename, content } = p.file(skill);
      assert.ok(filename.startsWith('ppk-'), `${p.id}/${skill.name} bad filename`);
      assert.ok(content.includes(skill.body.split('\n')[0]), `${p.id}/${skill.name} missing body`);
    }
  }
});

test('gemini output is valid-ish TOML with a literal prompt block', () => {
  const gemini = getProvider('gemini');
  for (const skill of skills) {
    const { filename, content } = gemini.file(skill);
    assert.match(filename, /\.toml$/);
    assert.match(content, /^description = ".*"$/m);
    assert.match(content, /prompt = '''/);
    assert.equal((content.match(/'''/g) || []).length, 2, `${skill.name}: prompt literal not balanced`);
  }
});

test('claude/windsurf markdown carries a description frontmatter; codex/cursor do not', () => {
  for (const id of ['claude', 'windsurf']) {
    for (const skill of skills) {
      assert.match(getProvider(id).file(skill).content, /^---\ndescription: /);
    }
  }
  for (const id of ['codex', 'cursor']) {
    for (const skill of skills) {
      assert.doesNotMatch(getProvider(id).file(skill).content, /^---\ndescription: /);
    }
  }
});

test('context resolves home and cwd, providers expose a target dir', () => {
  const ctx = context({ home: '/tmp/home', cwd: '/tmp/proj' });
  for (const p of PROVIDERS) {
    const dir = p.dir(ctx);
    assert.ok(dir.startsWith(p.scope === 'user' ? '/tmp/home' : '/tmp/proj'), `${p.id} dir scope`);
    assert.equal(typeof p.detect(ctx), 'boolean');
  }
});
```

### `tests/skills.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { loadSkills, parseSkill } = require('../bin/lib/skills.js');

test('loadSkills discovers all five workflow commands', () => {
  const skills = loadSkills(ROOT);
  const names = skills.map((s) => s.name).sort();
  assert.deepEqual(names, ['finish-task', 'init-prd', 'make-plan', 'start-task', 'status']);
});

test('every skill has a non-empty description and body', () => {
  for (const skill of loadSkills(ROOT)) {
    assert.ok(skill.description.length > 0, `${skill.name} missing description`);
    assert.ok(skill.body.length > 0, `${skill.name} missing body`);
    assert.equal(skill.command, `ppk-${skill.name}`);
  }
});

test('parseSkill reads folded description frontmatter', () => {
  const { frontmatter, body } = parseSkill('---\nname: demo\ndescription: >\n  line one\n  line two\n---\nbody here');
  assert.equal(frontmatter.name, 'demo');
  assert.equal(frontmatter.description, 'line one line two');
  assert.equal(body, 'body here');
});
```

### `tests/sync.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('generated artifacts are in sync with skills/ (npm run sync:check)', () => {
  // Throws if exit code != 0, i.e. commands/ or plugins/ are stale.
  execFileSync('node', ['scripts/sync.js', '--check'], { cwd: ROOT, stdio: 'pipe' });
});
```

