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