import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseSkill } = require('../bin/lib/skills.js');
const { tomlLiteral } = require('../bin/lib/providers.js');

// ── parseSkill edge cases ──────────────────────────────────────────────────

test('parseSkill: missing frontmatter returns body as-is', () => {
  const { frontmatter, body } = parseSkill('just a body, no delimiters');
  assert.deepEqual(frontmatter, {});
  assert.equal(body, 'just a body, no delimiters');
});

test('parseSkill: empty body returns empty string', () => {
  const { body } = parseSkill('---\nname: demo\n---\n');
  assert.equal(body, '');
});

test('parseSkill: empty body (no trailing newline after ---)', () => {
  const { body } = parseSkill('---\nname: demo\n---');
  assert.equal(body, '');
});

test('parseSkill: broken YAML line (no colon) is silently skipped', () => {
  const { frontmatter } = parseSkill('---\nname: ok\nnot-a-kv-pair\ndescription: fine\n---\nbody');
  assert.equal(frontmatter.name, 'ok');
  assert.equal(frontmatter.description, 'fine');
  // broken line does not crash or produce garbage key
  assert.equal(Object.keys(frontmatter).length, 2);
});

test('parseSkill: CRLF and LF produce identical output', () => {
  const lf = parseSkill('---\nname: test\ndescription: hello\n---\nbody text');
  const crlf = parseSkill('---\r\nname: test\r\ndescription: hello\r\n---\r\nbody text');
  assert.deepEqual(lf.frontmatter, crlf.frontmatter);
  assert.equal(lf.body, crlf.body);
});

test('parseSkill: folded (>) block scalar joins lines with space', () => {
  const { frontmatter } = parseSkill('---\ndescription: >\n  line one\n  line two\n---\nbody');
  assert.equal(frontmatter.description, 'line one line two');
});

test('parseSkill: literal (|) block scalar joins lines with space', () => {
  const { frontmatter } = parseSkill('---\ndescription: |\n  line one\n  line two\n---\nbody');
  assert.equal(frontmatter.description, 'line one line two');
});

test('parseSkill: multiple frontmatter keys all parsed', () => {
  const { frontmatter } = parseSkill('---\nname: foo\ndescription: bar\nauthor: baz\n---\nbody');
  assert.equal(frontmatter.name, 'foo');
  assert.equal(frontmatter.description, 'bar');
  assert.equal(frontmatter.author, 'baz');
});

test('parseSkill: body with multiple lines preserved', () => {
  const raw = '---\nname: x\n---\nline 1\nline 2\nline 3';
  const { body } = parseSkill(raw);
  assert.equal(body, 'line 1\nline 2\nline 3');
});

// ── tomlLiteral edge cases ─────────────────────────────────────────────────

test("tomlLiteral: throws if body contains '''", () => {
  assert.throws(
    () => tomlLiteral("before ''' after"),
    /cannot emit TOML literal/
  );
});

test("tomlLiteral: wraps value in ''' delimiters", () => {
  const result = tomlLiteral('hello world');
  assert.ok(result.startsWith("'''\n"));
  assert.ok(result.endsWith("\n'''"));
  assert.ok(result.includes('hello world'));
});
