# Engineering Agent Pipeline (installation branch)

This branch holds only what you need to install the pipeline into a project. Development (sample
apps, self-tests, PRD) happens on `master`.

The pipeline makes AI coding agents in Cursor (and Claude Code) work like a standardised
engineer:

intent → 7-item intake → audit → plan → **approval** → build → **review gate** (validator +
code-reviewer + security-auditor) → docs → memory.

## Install into a project
```powershell
git clone -b installation https://github.com/Manishh-Anand/EngineeringPipeline.git C:\tools\engineering-pipeline
cd C:\path\to\your-project
node C:\tools\engineering-pipeline\scripts\install.mjs . --dry-run   # preview
node C:\tools\engineering-pipeline\scripts\install.mjs .
```
The installer never overwrites existing files and lists any conflicts for you to merge. Then:
1. Add your project's conventions to `.agent/memory/conventions.md`.
2. Run `node scripts/check-pipeline.mjs`.
3. Commit through a PR.

## Update a project to a newer release
```powershell
git -C C:\tools\engineering-pipeline pull
node C:\tools\engineering-pipeline\scripts\install.mjs C:\path\to\your-project --update
```
Files you haven't edited are updated. Files you edited are listed, not overwritten.
`.agent/memory/` is never touched.

## What gets installed
| Path | What it is |
|---|---|
| `AGENTS.md`, `CLAUDE.md` | Router: intent → Cursor mode → skills, risk lanes, gates |
| `.cursor/rules/` | Standards: 3 always on (core, security, ponytail); 11 attached by file type |
| `.cursor/skills/` | 7 pipeline skills + 6 vetted external skills ([register](docs/EXTERNAL_SKILLS.md)) |
| `.claude/agents/` | Review-gate subagents: `validator`, `code-reviewer`, `security-auditor` |
| `.agent/templates/`, `.agent/memory/` | Artifact skeletons and team memory |
| `.cursor/mcp.json`, `.mcp.json` | Context7 (library docs) and Playwright (UI checks) |

## Guides
- [Testing it in Cursor](docs/TESTING_IN_CURSOR.md)
- [Rolling it out to the team](docs/DISTRIBUTION.md)
