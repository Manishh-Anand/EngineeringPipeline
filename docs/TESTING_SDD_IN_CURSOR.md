# Spec-Driven Development (SDD) Pipeline: Cursor Verification Guide

This guide provides step-by-step instructions for testing the upgraded Spec-Driven Development (SDD) pipeline in Cursor.

---

## 1. Prerequisites and Setup in Cursor

### Environment Requirements
- **Cursor IDE**: Version 2.4 or later (supports subagents and native Plan/Ask/Debug/Agent modes).
- **Model**: Vision-capable model (Claude 3.7 Sonnet, Claude 3.5 Sonnet, or GPT-4o) so visual references and screenshots can be transcribed.
- **Runtimes**: Node 20+, .NET 10 SDK (for sample api), Python 3.11+ (if testing Python).

### Verifying Cursor Setup
Open the repository in Cursor:
```powershell
cursor C:\EngineeringPipeline
```
Go to **Cursor Settings** (`Ctrl+,` or Gear icon) → **Rules / Skills / Subagents / MCP**:

| Capability | What to Check | Expected Status |
|---|---|---|
| **Rules** | `.cursor/rules/*.mdc` | 14 rules. `engineering-core`, `security`, and `ponytail` are *Always Apply*; the remaining 11 are scoped by glob patterns. |
| **Skills** | `.cursor/skills/` | 9 internal skills (`requirements-intake`, `codebase-audit`, `architecture-review`, `tasks`, `validation`, `code-review`, `convergence`, `documentation`, `project-memory`) + 6 vendored skills. |
| **Subagents** | `.claude/agents/` | 3 subagents: `validator`, `code-reviewer`, `security-auditor`. |
| **MCP** | `.cursor/mcp.json` | `context7` (docs lookup) and `playwright` (browser UI validation). |

> **Tip**: If Cursor has not refreshed loaded skills or rules, press `Ctrl+Shift+P` and execute **Developer: Reload Window**.

---

## 2. Testing the Pipeline Check (Quality Gates)

Run the linter and structure check from your terminal:
```powershell
node .agent/scripts/check-pipeline.mjs
```
Expected output:
```text
Pipeline check PASSED
```
This confirms:
- All required rules, internal skills, templates, and subagents are present.
- All rules and skills adhere to frontmatter specifications and strict line caps.
- No duplicated instruction blocks across skills/rules.
- Router (`AGENTS.md`) is within the 150-line limit and routes all internal skills.

---

## 3. SDD Workflow Stages in Cursor

When executing features, verify that the agent progresses through the formal SDD lifecycle:

```text
1. Start & Memory Check
   ↓ (Reads .agent/memory/INDEX.md; classifies intent & risk)
2. Requirements Intake (Specify & Clarify)
   ↓ (7-item questionnaire pre-filled with inferences; clarifies only ambiguities)
3. Codebase Audit & Architecture Review
   ↓ (Inspects real manifests, maps layers, classifies Reuse/Modify/Create/Avoid)
4. Implementation Plan & Tasks Decomposition
   ↓ (PLAN.md steps broken into T001..Tnnn in TASKS.md with dependencies)
5. Pre-Implementation Consistency Check
   ↓ (Verifies Spec ↕ Plan ↕ Tasks ↕ Architecture; resolves conflicts)
6. Human Approval Gate
   ↓ (Presents plan & tasks; awaits 'Approve and build' or Plan mode Build action)
7. Implementation (Agent Mode)
   ↓ (Executes tasks T001..Tnnn in dependency order)
8. Review Gate
   ↓ (Runs validator, code-reviewer, and security-auditor in parallel)
9. SDD Convergence Check
   ↓ (Audits actual code/tests against original spec & tasks; produces CONVERGENCE.md)
10. Documentation & Final Report
   ↓ (Updates docs/features/, proposes memory ADRs, emits structured final report)
```

---

## 4. Test Scenarios

### Scenario A: Greenfield Feature (Plan Mode)
Test starting from a blank project or new feature area.

1. In Cursor, switch mode to **Plan**.
2. Open a new chat (`Ctrl+L`) and submit:
   ```text
   Build an employee expense claim feature: employees submit expense receipts with amount and category, and managers review and approve or reject them.
   ```
3. **Verify Intake (Specify & Clarify)**:
   - [ ] Agent announces: `Detected: Feature · Medium/High risk` and reads `.agent/memory/INDEX.md`.
   - [ ] Agent displays the **7-item intake questionnaire**:
     1. **Title**: Inferred (e.g., "Employee Expense Claim Management").
     2. **Screenshot / reference**: Pre-filled options (1: Paste/drag, 2: @-mention, 3: Match page, 4: No visual reference).
     3. **Features/sub-features**: Proposed numbered list (F1: Submit expense, F2: Manager review/approval, F3: History/list).
     4. **Actors**: Employee and Manager pre-selected.
     5. **Rules**: Inferred validation rules (positive amount, required receipt, managers cannot approve own claims).
     6. **Data elements**: Proposed schema table (ClaimId, EmployeeId, Amount, Category, ReceiptUrl, Status, CreatedAt).
     7. **Architecture / folder structure**: Proposed directory layout.
   - [ ] Options are numbered with `(recommended)` defaults.
4. Reply in shorthand:
   ```text
   1. ok  2. 4  3. 1  4. 1,2  5. 1  6. 1  7. 1
   ```
5. **Verify Plan, Tasks, and Consistency Check**:
   - [ ] Agent performs `codebase-audit` and `architecture-review` (Reuse/Modify/Create/Avoid).
   - [ ] Agent drafts `PLAN.md` with file-specific steps.
   - [ ] Agent decomposes plan into **ordered tasks** (`TASKS.md`):
     - `T001`: Data models / schema
     - `T002`: Backend API endpoints / service
     - `T003`: Automated backend tests
     - `T004`: Frontend UI components
     - `T005`: Frontend tests
     - `T006`: Quality gate execution
   - [ ] Agent runs the **5-dimension consistency check** (Requirements coverage, Architecture alignment, Task dependencies, Test coverage, Database safety).
   - [ ] Agent pauses for **Approval**:
     ```text
     Plan and tasks complete.
     1. Approve and build
     2. Modify the plan
     3. Show more detail
     4. Cancel
     ```
6. Click **Build** (or reply `1`).
7. **Verify Implementation, Validation & Convergence**:
   - [ ] Tasks are executed in dependency order.
   - [ ] **Review gate** runs: `validator`, `code-reviewer`, `security-auditor` run in parallel.
   - [ ] **Convergence check** runs: verifies all AC1..ACn are met with passing tests, all T001..Tnnn executed, zero unauthorized architecture drift. Emits `CONVERGENCE.md` with status `CONVERGED`.
   - [ ] `docs/features/expense-claims.md` created.
   - [ ] Final report summary emitted.

---

### Scenario B: React / TypeScript Feature (Plan Mode)
Test modifying an existing React application (`samples/web`).

1. Open `samples/web` in Cursor.
2. In **Plan mode**, submit:
   ```text
   Add a search and status filter bar above the application list table in the dashboard.
   ```
3. **Observations**:
   - [ ] Intake infers existing components from `samples/web/src/components/`.
   - [ ] Item 7 proposes placing the new component in `src/components/FilterBar.tsx` and updating `Dashboard.tsx`.
   - [ ] Plan reuses existing types and styling tokens.
   - [ ] Tasks breakdown creates component, hooks integration, and test tasks.
   - [ ] Review gate checks TypeScript types, Vite build, and React composition patterns.
   - [ ] Convergence confirms filter functionality matches requirements without modifying unrelated dashboard widgets.

---

### Scenario C: C# / ASP.NET Core API Feature (Plan Mode)
Test modifying an existing .NET API (`samples/api`).

1. Open `samples/api` in Cursor.
2. In **Plan mode**, submit:
   ```text
   Add an endpoint to export application records as a CSV summary.
   ```
3. **Observations**:
   - [ ] Intake identifies actors and authentication requirements.
   - [ ] Audit locates `ApplicationEndpoints.cs`, `ApplicationService.cs`, and `ApplicationDbContext.cs`.
   - [ ] Plan reuses `IApplicationService` and keeps endpoint inside `RequireAuthorization()`.
   - [ ] Tasks include `dotnet test` verification.
   - [ ] Security auditor validates authorization and input sanitization.
   - [ ] Convergence confirms endpoint contract matches specification.

---

### Scenario D: Bug Fix (Debug Mode)
Test diagnostic and recovery workflow.

1. Switch Cursor mode to **Debug**.
2. Submit:
   ```text
   In samples/web/src/pages/Dashboard.tsx, the table displays all items even when a status filter is selected.
   ```
3. **Observations**:
   - [ ] Agent uses `debugging-and-error-recovery`: reproduces issue → isolates root cause (`applications` passed instead of `visibleApplications`) → applies minimal fix.
   - [ ] Adds or updates a regression test.
   - [ ] Review gate validates that tests pass and no regression was introduced.
   - [ ] No 7-item questionnaire is triggered (appropriate bug lane).

---

### Scenario E: Codebase Investigation (Ask Mode)
Test read-only analysis without edits.

1. Switch Cursor mode to **Ask**.
2. Submit:
   ```text
   How does authentication and authorization work in samples/api?
   ```
3. **Observations**:
   - [ ] Agent runs read-only `codebase-audit`.
   - [ ] Explains authentication mechanisms (e.g. `ApiKeyAuthenticationHandler`) with exact `file:line` references.
   - [ ] `git status` remains completely clean (zero file modifications).

---

## 5. Definition of Done Checklist for Test Runs

For any feature run, verify that all following artifacts exist under `.agent/work/<YYYYMMDD-slug>/`:
- [ ] `INTAKE.md`: 7 items with user confirmations.
- [ ] `REQUIREMENTS.md`: Specified features, rules, reference transcription, and AC.
- [ ] `CODEBASE_CONTEXT.md`: Real stack, commands, patterns, and reuse map.
- [ ] `PLAN.md`: Architecture review, approach, steps, and risks.
- [ ] `TASKS.md`: Ordered tasks (T001..Tnnn) with prerequisites, files, verify checks, and consistency matrix.
- [ ] `VALIDATION.md`: Tooling evidence, test runs, and AC test mappings.
- [ ] `REVIEW.md`: Correctness, architecture, reuse, and standards audit.
- [ ] `SECURITY.md`: OWASP/threat analysis and authorization check.
- [ ] `CONVERGENCE.md`: Spec vs implementation audit confirming `CONVERGED`.
