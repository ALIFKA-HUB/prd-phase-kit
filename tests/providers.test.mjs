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
  const ctx = context({ home: path.join('/', 'tmp', 'home'), cwd: path.join('/', 'tmp', 'proj') });
  for (const p of PROVIDERS) {
    const dir = p.dir(ctx);
    const expectedPrefix = p.scope === 'user' ? path.join('/', 'tmp', 'home') : path.join('/', 'tmp', 'proj');
    assert.ok(dir.startsWith(expectedPrefix), `${p.id} dir scope`);
    assert.equal(typeof p.detect(ctx), 'boolean');
  }
});