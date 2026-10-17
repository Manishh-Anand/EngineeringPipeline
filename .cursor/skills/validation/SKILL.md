---
name: validation
description: Independently validate a finished implementation against requirements, plan, architecture, coding rules, and the project's real typecheck/lint/test/build tooling; write VALIDATION.md with evidence. Use after every implementation (both lanes), ideally via the validator subagent so it runs in a fresh context.
---
# Validation

## Purpose
Prove that the change is correct with evidence. The implementer's opinion doesn't count.

## Trigger
After implementation, in both lanes. Prefer running it as the `validator` subagent
(`.claude/agents/validator.md`), so the check gets a fresh context.

## Inputs
- `REQUIREMENTS.md` and `PLAN.md` (the quick lane may have neither; use the request instead).
- The diff (`git diff` against the base).
- The tooling commands recorded in `CODEBASE_CONTEXT.md`.

## Process
1. **Discover checks**, using the project's real commands only. Never invent a command.

   | Stack | Source of commands | Typical checks |
   |---|---|---|
   | Node/React/TS | `package.json` scripts | typecheck, lint, test, build |
   | .NET | `.sln`/`.csproj`, CI | `dotnet build` (warnings), `dotnet test` |
   | SQL | migrations, `.sql` | migration script generation, impact present in plan |
   | Python | `pyproject`, CI | pytest; ruff/mypy only if configured |

   If a check isn't configured, record `NOT RUN: not configured`. Don't add tooling.
2. **Run** each command and keep the exit code plus the relevant output lines as evidence.
3. **Review the diff**:
   - **Requirements**: every acceptance criterion is met and has a test.
   - **Plan**: there is no unplanned file or behaviour. Any scope creep is a finding.
   - **Architecture**: re-check layer, dependency direction and reuse (see `architecture-review`).
   - **Standards**: the matching `.cursor/rules` for each changed file.
   - **Security**: secrets, input validation, parameterised SQL, authorization on new endpoints.
   - **Tests**: none deleted, skipped or weakened; no checks disabled to get green.
   - **Docs**: updated if behaviour or contracts changed.
4. Write `.agent/work/<id>/VALIDATION.md` from the template. Each section is PASS / FAIL /
   NOT RUN (reason). Every FAIL lists severity (High/Med/Low), file, location, problem, impact
   and recommended fix.
5. Result:
   - **PASS** only if every required check passed.
   - Otherwise show the `Validation failed. N issues found.` menu from AGENTS.md §8.

## Output
`VALIDATION.md` and a one-screen summary.

## Guardrails
- Evidence before claims: no PASS without a command run or a specific line cited.
- The validator does not edit source. Fixes happen in the implementing context and are then
  re-validated.
- Never mark a skipped check as PASS.

## Stop conditions
The tooling can't run (missing SDK, no network for restore). Report it as NOT RUN with the error,
and don't claim success.
