import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INSTALL = path.join(ROOT, 'bin', 'install.js');

/** Run install.js with given args, return { stdout, stderr, exitCode }. */
function run(args = [], env = {}) {
  try {
    const stdout = execFileSync(process.execPath, [INSTALL, ...args], {
      encoding: 'utf8',
      env: { ...process.env, ...env },
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status ?? 1,
    };
  }
}

// ── --help ──────────────────────────────────────────────────────────────────

test('--help prints Usage and exits 0', () => {
  const { stdout, exitCode } = run(['--help']);
  assert.equal(exitCode, 0);
  assert.ok(stdout.includes('Usage'), `expected "Usage" in:\n${stdout}`);
  assert.ok(stdout.includes('--all'), `expected "--all" flag listed`);
  assert.ok(stdout.includes('--list'), `expected "--list" flag listed`);
});

test('-h is alias for --help', () => {
  const { stdout, exitCode } = run(['-h']);
  assert.equal(exitCode, 0);
  assert.ok(stdout.includes('Usage'));
});

// ── --list ───────────────────────────────────────────────────────────────────

test('--list prints all 5 supported agent IDs', () => {
  const { stdout, exitCode } = run(['--list']);
  assert.equal(exitCode, 0);
  for (const id of ['gemini', 'claude', 'codex', 'cursor', 'windsurf']) {
    assert.ok(stdout.includes(id), `expected agent id "${id}" in --list output`);
  }
});

// ── --dry-run ────────────────────────────────────────────────────────────────

test('--dry-run --all prints "would write" and creates no files', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'ppk-test-'));
  try {
    // Point home + cwd to temp dir so no real dirs are used
    const { stdout, exitCode } = run(['--dry-run', '--all'], {
      HOME: tmp,
      USERPROFILE: tmp,
      APPDATA: tmp,
    });
    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('would write'), `expected "would write" in:\n${stdout}`);
    // Temp dir should only contain what OS creates (no ppk files written)
    const entries = readdirSync(tmp);
    assert.equal(entries.length, 0, `expected empty tmp dir, got: ${entries.join(', ')}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ── --only ────────────────────────────────────────────────────────────────────

test('--only with unknown agent exits 1 and prints error', () => {
  const { stderr, exitCode } = run(['--only', 'unknown-agent']);
  assert.equal(exitCode, 1);
  assert.ok(
    stderr.includes('Unknown') || stderr.includes('unknown-agent'),
    `expected error message, got: ${stderr}`
  );
});

test('--only with valid agent exits 0', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'ppk-test-'));
  try {
    const { exitCode } = run(['--only', 'gemini', '--dry-run'], {
      HOME: tmp,
      USERPROFILE: tmp,
    });
    assert.equal(exitCode, 0);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ── No agents detected ───────────────────────────────────────────────────────

test('no agents detected prints guidance and exits 0', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'ppk-noagents-'));
  try {
    // HOME points to empty dir — no .gemini, .claude etc → nothing detected
    const { stdout, exitCode } = run([], {
      HOME: tmp,
      USERPROFILE: tmp,
      APPDATA: tmp,
    });
    assert.equal(exitCode, 0);
    assert.ok(
      stdout.includes('No supported') || stdout.includes('--all') || stdout.includes('--list'),
      `expected "no agents" guidance in:\n${stdout}`
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
