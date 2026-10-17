// Self-tests for the pipeline tooling. Run: node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { check } from './check-pipeline.mjs';
import { install } from './install.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const COPY = ['AGENTS.md', 'CLAUDE.md', '.cursor', '.claude', '.agent', 'docs'];

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-'));
  for (const p of COPY) fs.cpSync(path.join(ROOT, p), path.join(dir, p), { recursive: true });
  return dir;
}
const edit = (dir, rel, fn) => fs.writeFileSync(path.join(dir, rel), fn(fs.readFileSync(path.join(dir, rel), 'utf8')));
const expectError = (dir, re) => assert.ok(check(dir).some((e) => re.test(e)), `expected ${re} in:\n${check(dir).join('\n')}`);

test('the repo itself passes', () => assert.deepEqual(check(ROOT), []));

test('missing required skill fails', () => {
  const d = fixture();
  fs.rmSync(path.join(d, '.cursor/skills/validation'), { recursive: true });
  expectError(d, /validation: required skill missing/);
});

test('skill name must match folder', () => {
  const d = fixture();
  edit(d, '.cursor/skills/documentation/SKILL.md', (s) => s.replace('name: documentation', 'name: docs'));
  expectError(d, /must match folder/);
});

test('oversized skill fails', () => {
  const d = fixture();
  edit(d, '.cursor/skills/codebase-audit/SKILL.md', (s) => s + '\nfiller line\n'.repeat(120));
  expectError(d, /codebase-audit\/SKILL.md: \d+ lines > cap 150/);
});

test('extra alwaysApply rule fails (progressive loading)', () => {
  const d = fixture();
  edit(d, '.cursor/rules/react.mdc', (s) => s.replace('alwaysApply: false', 'alwaysApply: true'));
  expectError(d, /react.mdc: alwaysApply is reserved/);
});

test('instructions duplicated between a skill and a rule fail', () => {
  const d = fixture();
  const block = fs.readFileSync(path.join(d, '.cursor/rules/engineering-core.mdc'), 'utf8').split('## Reuse before create')[1].split('## Scope')[0];
  edit(d, '.cursor/skills/documentation/SKILL.md', (s) => s + '\n' + block);
  expectError(d, /duplicates 3\+ lines/);
});

test('unregistered vendored skill fails', () => {
  const d = fixture();
  fs.mkdirSync(path.join(d, '.cursor/skills/random-skill'));
  fs.writeFileSync(path.join(d, '.cursor/skills/random-skill/SKILL.md'), '---\nname: random-skill\ndescription: x\n---\n<!-- Vendored from someone/repo@abc1234 -->\n');
  expectError(d, /random-skill.*LICENSE/);
  expectError(d, /random-skill.*docs\/EXTERNAL_SKILLS.md/);
});

test('installer copies, never overwrites, reports conflicts, is idempotent', () => {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'target-'));
  fs.writeFileSync(path.join(t, 'AGENTS.md'), '# existing project agents file\n');
  fs.writeFileSync(path.join(t, '.gitignore'), 'node_modules/');
  const r1 = install(t);
  assert.deepEqual(r1.conflicts, ['AGENTS.md']);
  assert.equal(fs.readFileSync(path.join(t, 'AGENTS.md'), 'utf8'), '# existing project agents file\n');
  assert.ok(r1.copied.includes(path.join('.cursor', 'skills', 'validation', 'SKILL.md')));
  assert.match(fs.readFileSync(path.join(t, '.gitignore'), 'utf8'), /node_modules\/\n# Engineering.*\n\.agent\/work\/\*\n/);
  const r2 = install(t);
  assert.equal(r2.copied.length, 0);
  assert.deepEqual(r2.gitignore, []);
  // Installed tree (minus the conflicting AGENTS.md) still lints except for routing checks tied to AGENTS.md
  fs.copyFileSync(path.join(ROOT, 'AGENTS.md'), path.join(t, 'AGENTS.md'));
  assert.deepEqual(check(t), []);
});
