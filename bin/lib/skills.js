'use strict';

const fs = require('fs');
const path = require('path');

/** Parse a SKILL.md into { frontmatter, body }. Minimal YAML (key: value, folded >). */
function parseSkill(raw, { filename = 'unknown' } = {}) {
  raw = raw.replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) {
    console.warn(`[ppk] ${filename}: no frontmatter found (missing --- delimiters)`);
    return { frontmatter: {}, body: raw.trim() };
  }
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
  if (!fm.name) console.warn(`[ppk] ${filename}: missing required field "name" in frontmatter`);
  if (!fm.description) console.warn(`[ppk] ${filename}: missing required field "description" in frontmatter`);
  return { frontmatter: fm, body: m[2].trim() };
}

/** Load all skills from a repo root's skills/ dir (excludes _shared). */
function loadSkills(rootDir) {
  const skillsDir = path.join(rootDir, 'skills');
  const skills = [];
  const dirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== '_shared')
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(skillsDir, name, 'SKILL.md')))
    .sort();
  for (const name of dirs) {
    const skillPath = path.join(skillsDir, name, 'SKILL.md');
    try {
      const raw = fs.readFileSync(skillPath, 'utf8');
      const { frontmatter, body } = parseSkill(raw, { filename: `skills/${name}/SKILL.md` });
      skills.push({
        name,
        command: `ppk-${name}`,
        description: (frontmatter.description || `PRD Phase Kit ${name}`).replace(/\s+/g, ' ').trim(),
        body,
      });
    } catch (err) {
      console.error(`[ppk] Failed to read skills/${name}/SKILL.md: ${err.message}`);
    }
  }
  return skills;
}

module.exports = { parseSkill, loadSkills };