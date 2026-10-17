# Testing the SDD Pipeline in Cursor

As requested, tests were **not run** during implementation. This file contains the complete test procedure for you to test and verify the Spec-Driven Development (SDD) pipeline in Cursor.

---

## 1. Quick Quality Gate Check
Run the structural linter from your terminal:
```powershell
node .agent/scripts/check-pipeline.mjs
```
Expected output:
```text
Pipeline check PASSED
```

---

## 2. Cursor Verification Checklist

1. Open this repository in Cursor:
   ```powershell
   cursor C:\EngineeringPipeline
   ```
2. Verify Cursor loaded configurations in **Settings → Rules / Skills / Subagents / MCP**:
   - **Rules**: 14 `.mdc` rules (`engineering-core`, `security`, and `ponytail` always applied; 11 tech-specific rules auto-attached by globs).
   - **Skills**: 9 internal skills (`requirements-intake`, `codebase-audit`, `architecture-review`, `tasks`, `validation`, `code-review`, `convergence`, `documentation`, `project-memory`) + 6 external skills.
   - **Subagents**: 3 subagents (`validator`, `code-reviewer`, `security-auditor`).
   - **MCP**: `context7` and `playwright`.

---

## 3. Testing Workflows by Cursor Native Mode

### A. Plan Mode → SDD Feature Flow
1. Select **Plan mode** in chat.
2. Prompt:
   ```text
   Build an employee expense claim feature: employees submit expense receipts with amount and category, and managers review and approve or reject them.
   ```
3. Check the **Specify & Clarify Intake**:
   - Announce: `Detected: Feature · Medium/High risk`
   - Inferred 7 items presented: Title, Screenshot/reference, Features/sub-features, Actors, Rules, Data elements, Architecture/folder structure.
   - Choices offered as `1) (recommended) ... 2) ... 3) Other: ___`.
4. Reply: `1. ok 2. 4 3. 1 4. 1,2 5. 1 6. 1 7. 1`.
5. Check the **Plan, Tasks & Consistency Check**:
   - `PLAN.md` generated with `Reuse / Modify / Create / Avoid` table.
   - `TASKS.md` generated with actionable tasks (`T001`, `T002`...) ordered by dependency.
   - Consistency check verifies: Requirements ↕ Plan ↕ Tasks ↕ Architecture.
   - Approval prompt displayed:
     ```text
     Plan and tasks complete.
     1. Approve and build
     2. Modify the plan
     3. Show more detail
     4. Cancel
     ```
6. Click **Build** to approve.
7. Check **Implementation, Review Gate & Convergence**:
   - Tasks executed in dependency order.
   - Review gate subagents (`validator`, `code-reviewer`, `security-auditor`) execute in parallel.
   - `convergence` audits the implementation against the original specification and tasks, emitting `CONVERGENCE.md` (`CONVERGED`).
   - Documentation and Memory updated.

### B. Debug Mode → Bug Fix Flow
1. Select **Debug mode** in chat.
2. Prompt:
   ```text
   In samples/web/src/pages/Dashboard.tsx, the table displays all items even when a status filter is selected.
   ```
3. Check that it skips the 7-item intake, isolates the root cause, applies the minimal fix, adds a regression test, and runs the review gate.

### C. Ask Mode → Read-Only Investigation Flow
1. Select **Ask mode** in chat.
2. Prompt:
   ```text
   How does authentication and authorization work in samples/api?
   ```
3. Check that the audit explains the mechanism with `file:line` references without making any file edits (`git status` clean).

---

## 4. Full Guide
For comprehensive multi-stack test scenarios (React/TS, C#/ASP.NET Core, SQL Server, Python), see [docs/TESTING_SDD_IN_CURSOR.md](docs/TESTING_SDD_IN_CURSOR.md).
