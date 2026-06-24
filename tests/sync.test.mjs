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