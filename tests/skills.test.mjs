import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { loadSkills, parseSkill } = require('../bin/lib/skills.js');

test('loadSkills discovers all six workflow commands', () => {
  const skills = loadSkills(ROOT);
  const names = skills.map((s) => s.name).sort();
  assert.deepEqual(names, ['finish-task', 'init-prd', 'make-plan', 'reset', 'start-task', 'status']);
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

test('parseSkill normalizes CRLF line endings', () => {
  const { frontmatter, body } = parseSkill('---\r\nname: crlf\r\ndescription: test\r\n---\r\nbody here\r\nand here');
  assert.equal(frontmatter.name, 'crlf');
  assert.equal(frontmatter.description, 'test');
  assert.equal(body, 'body here\nand here');
});

test('every skill command field is ppk-<name>', () => {
  for (const skill of loadSkills(ROOT)) {
    assert.equal(skill.command, `ppk-${skill.name}`, `${skill.name}: unexpected command format`);
  }
});

test('every skill description has no double spaces', () => {
  for (const skill of loadSkills(ROOT)) {
    assert.ok(
      !skill.description.includes('  '),
      `${skill.name}: description contains double spaces: "${skill.description}"`
    );
  }
});

test('every skill description has no leading or trailing whitespace', () => {
  for (const skill of loadSkills(ROOT)) {
    assert.equal(
      skill.description,
      skill.description.trim(),
      `${skill.name}: description has leading/trailing whitespace`
    );
  }
});