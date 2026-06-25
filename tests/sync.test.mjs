import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { loadSkills } = require('../bin/lib/skills.js');

test('generated artifacts are in sync with skills/ (npm run sync:check)', () => {
  // Throws if exit code != 0, i.e. commands/ or plugins/ are stale.
  execFileSync('node', ['scripts/sync.js', '--check'], { cwd: ROOT, stdio: 'pipe' });
});

test('commands/ contains exactly one .toml per skill', () => {
  const skills = loadSkills(ROOT);
  const commandsDir = path.join(ROOT, 'commands');
  const tomlFiles = readdirSync(commandsDir).filter((f) => f.endsWith('.toml'));
  assert.equal(
    tomlFiles.length,
    skills.length,
    `expected ${skills.length} .toml files, got ${tomlFiles.length}: ${tomlFiles.join(', ')}`
  );
  for (const skill of skills) {
    const expected = `${skill.command}.toml`;
    assert.ok(
      tomlFiles.includes(expected),
      `missing commands/${expected}`
    );
  }
});

test('plugin mirror contains a SKILL.md for every skill', () => {
  const skills = loadSkills(ROOT);
  const pluginSkillsDir = path.join(ROOT, 'plugins', 'prd-phase-kit', 'skills');
  for (const skill of skills) {
    const mirrored = path.join(pluginSkillsDir, skill.name, 'SKILL.md');
    assert.ok(existsSync(mirrored), `missing plugin mirror: plugins/prd-phase-kit/skills/${skill.name}/SKILL.md`);
  }
});

test('plugin mirror contains shared conventions.md', () => {
  const conventionsPath = path.join(ROOT, 'plugins', 'prd-phase-kit', 'skills', '_shared', 'conventions.md');
  assert.ok(existsSync(conventionsPath), 'missing plugins/prd-phase-kit/skills/_shared/conventions.md');
});