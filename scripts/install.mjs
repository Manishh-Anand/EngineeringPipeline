#!/usr/bin/env node
// Install the pipeline into a target repo without overwriting anything.
// Usage: node scripts/install.mjs <targetRepo> [--dry-run]
// Exit 0 = installed cleanly, 2 = installed with conflicts (existing differing files were left untouched).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// Pipeline-owned paths. .agent/memory is a scaffold: copied only where the target has none of its own files.
const PATHS = [
  'AGENTS.md', 'CLAUDE.md', '.cursor/rules', '.cursor/skills', '.cursor/mcp.json', '.mcp.json',
  '.claude/agents', '.agent/templates', '.agent/memory', '.agent/work/.gitkeep',
  'docs/EXTERNAL_SKILLS.md', 'scripts/check-pipeline.mjs',
];
const GITIGNORE = ['.agent/work/*', '!.agent/work/.gitkeep'];

function walk(rel) {
  const abs = path.join(SRC, rel);
  if (fs.statSync(abs).isFile()) return [rel];
  return fs.readdirSync(abs).flatMap((f) => walk(path.join(rel, f)));
}

export function install(target, { dryRun = false } = {}) {
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) throw new Error(`target is not a directory: ${target}`);
  if (path.resolve(target) === path.resolve(SRC)) throw new Error('target is the pipeline repo itself');
  const result = { copied: [], identical: [], conflicts: [], gitignore: [] };
  for (const rel of PATHS.flatMap(walk)) {
    const from = path.join(SRC, rel), to = path.join(target, rel);
    if (fs.existsSync(to)) {
      (fs.readFileSync(to).equals(fs.readFileSync(from)) ? result.identical : result.conflicts).push(rel);
      continue;
    }
    if (!dryRun) { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); }
    result.copied.push(rel);
  }
  const gi = path.join(target, '.gitignore');
  const have = fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8').split(/\r?\n/) : [];
  result.gitignore = GITIGNORE.filter((l) => !have.includes(l));
  if (result.gitignore.length && !dryRun) {
    const prefix = have.length && have.at(-1) !== '' ? '\n' : '';
    fs.appendFileSync(gi, `${prefix}# Engineering Agent Pipeline working artifacts\n${result.gitignore.join('\n')}\n`);
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [target, ...flags] = process.argv.slice(2);
  if (!target) { console.error('Usage: node scripts/install.mjs <targetRepo> [--dry-run]'); process.exit(1); }
  const dryRun = flags.includes('--dry-run');
  const r = install(path.resolve(target), { dryRun });
  console.log(`${dryRun ? '[dry run] would copy' : 'Copied'} ${r.copied.length} files; ${r.identical.length} already identical.`);
  if (r.gitignore.length) console.log(`${dryRun ? 'Would add' : 'Added'} to .gitignore: ${r.gitignore.join(', ')}`);
  if (r.conflicts.length) {
    console.log(`\n${r.conflicts.length} existing file(s) differ and were NOT touched. Merge them by hand:`);
    for (const c of r.conflicts) console.log(`  - ${c}`);
    console.log('\nTip: if the repo already has AGENTS.md/CLAUDE.md, add the pipeline sections to it and keep CLAUDE.md importing @AGENTS.md.');
    process.exit(2);
  }
  console.log('\nNext: commit, then fill .agent/memory/conventions.md with project conventions. Run: node scripts/check-pipeline.mjs');
}
