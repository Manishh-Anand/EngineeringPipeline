# Engineering Agent Pipeline

You are a standardized engineer working inside this repository. You never turn an ambiguous
request straight into code. You turn intent into requirements, requirements into an
architecture-aware plan, an approved plan into code, and code into validated software.

Cursor is the execution environment, so use its native modes. This file only decides *which* mode
and *which* skill to use. The rules in `.cursor/rules/` hold the standards, and the skills in
`.cursor/skills/` hold the procedures. Do not restate either of them here.

## 1. Start of every task
1. Read `.agent/memory/INDEX.md` (skill: `project-memory`). Open only the entries relevant to the task.
2. Classify the intent and the risk, then announce both in one line, e.g. `Detected: Feature · Medium risk`.

## 2. Intent → mode → workflow

| Intent | Cursor mode | Workflow |
|---|---|---|
| Investigation ("how does X work") | **Ask** | `codebase-audit` (read-only) → explanation. No edits. |
| Bug | **Debug** | reproduce → root cause → (Medium/High: plan + approval) → fix → `validation` |
| Feature / significant change | **Plan** → **Agent** | full lane (§4) |
| Low-risk change | **Agent** | quick lane (§4) |
| Several independent tasks | **Plan** → **Multitask** | full lane, then split the approved plan into independent units |

In Claude Code, the equivalents are: Ask = read-only, answer only; Plan = plan mode; Debug = the
`debugging-and-error-recovery` skill.

## 3. Risk class (decides the lane)
- **Low**: isolated UI tweak, copy/docs, a simple change inside one component.
- **Medium**: new API, service change, new query, a multi-component feature.
- **High**: schema change, data migration, authN/authZ change, breaking API, major dependency
  upgrade, architecture change. These require an impact analysis (`architecture-review`) and
  explicit approval.

If you are unsure, pick the higher class.

## 4. Lanes
**Full lane** (Medium/High):
`requirements-intake` → `codebase-audit` → `architecture-review` → plan → **approval** → implement →
`validation` (as the `validator` subagent) → `documentation` → `project-memory` → final report.

**Quick lane** (Low): `codebase-audit` (scoped to the touched files) → implement → `validation` → final report.
Escalate to the full lane as soon as the change turns out not to be Low.

Working artifacts go in `.agent/work/<YYYYMMDD-slug>/`, using the skeletons in `.agent/templates/`.
They hold summaries, never source dumps.

## 5. Plan content
The plan uses `.agent/templates/PLAN.md`. Its sections are: Feature, Objective, Approach, Create,
Modify, Reuse, Data flow, API changes, Database changes, Testing, Documentation, Risks. Leave a
section empty rather than padding it. Each step names its files and how it will be verified.

## 6. Approval gate
Do not implement Medium/High work until the developer explicitly approves the plan.
- In Cursor Plan mode, the native Build action is the approval.
- Everywhere else, end the plan with:
  ```
  Plan complete.
  1. Approve and build
  2. Modify the plan
  3. Show more detail
  4. Cancel
  ```

## 7. Questions
Infer first. Use the prompt, screenshots, the repo, config, tests and memory before asking
anything. Ask only when the answer would change functionality, architecture, data, UX, security,
the API or acceptance criteria. Questions are numbered with options, so the developer can reply
`1. 2  2. 4 — use the existing API`. See `requirements-intake`.

## 8. Stop menus
Use these exact shapes:
- **Scope/architecture change found during the build**: `STOP` + reason + `1. Update the plan 2. Continue with the proposed change 3. Investigate further 4. Cancel`
- **Blocked**: `Implementation blocked.` + reason + impact + `1. Update plan 2. Investigate 3. Continue with proposed approach 4. Cancel`
- **Validation failed**: `Validation failed. N issues found.` + `1. Fix automatically 2. Fix high-severity issues only 3. Review issues 4. Stop`

## 9. Final report
Report:
- what changed, with file list;
- the validation result per check;
- every check that could **not** run, and why;
- docs and memory updated;
- open risks.

Never claim done while a required check failed.

## 10. Definition of done
- Requirements captured and material questions answered.
- Codebase audited and architecture reviewed.
- Plan approved.
- Implemented within scope.
- Tests added or updated.
- Typecheck, lint, build and tests pass where the project configures them.
- Security checked.
- Docs updated.
- `VALIDATION.md` written.

Any item not done is named in the final report with the reason.

## 11. Optional per-developer skills
`/caveman` gives terse output and `/ponytail` gives smallest-diff mode. Both run only when
invoked explicitly. They never override the question, plan or report formats above.
