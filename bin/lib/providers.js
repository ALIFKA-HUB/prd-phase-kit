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

module.exports = { PROVIDERS, getProvider, context, markdownCommand, tomlCommand, shortDesc, tomlLiteral };