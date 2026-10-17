# Testing the pipeline in Cursor

Test on a blank demo project first. It shows the whole flow, from an empty folder to a
validated feature. Create it from this branch:
```powershell
git clone -b installation https://github.com/Manishh-Anand/EngineeringPipeline.git C:\tools\engineering-pipeline
mkdir C:\PipelineDemo; cd C:\PipelineDemo; git init
node C:\tools\engineering-pipeline\scripts\install.mjs .
git add -A; git commit -m "Install Engineering Agent Pipeline"
```

You need Cursor 2.4 or later (for subagents), Node 22, the .NET 10 SDK, and optionally SQL Server
LocalDB.

## 0. One-time checks in Cursor
1. **Open the project.** `File → Open Folder → C:\PipelineDemo`, or `cursor C:\PipelineDemo`.
2. **Check what Cursor loaded** in **Cursor Settings → Rules / Skills / Subagents / MCP**:

   | Check | Expected |
   |---|---|
   | Rules | 13. `engineering-core` and `security` are *Always*; the other 11 are auto-attached by globs |
   | Skills | 14: 7 pipeline skills + 7 vendored. `caveman` and `ponytail` are manual-only |
   | Subagents | `validator`, `code-reviewer`, `security-auditor` |
   | MCP | `context7` and `playwright`. Turn them on |

   If something is missing, run `Ctrl+Shift+P` → **Developer: Reload Window**.
3. **Choose a vision-capable model** (e.g. Claude or GPT-5) so screenshots can be read.
4. **Sanity check.** In a new Agent chat, ask: `What workflow do you follow in this repo?` The
   answer should mention the 7-item intake, the approval gate, and the three-agent review gate.

## Screenshots: how to give one
- **Paste:** take a screenshot (`Win+Shift+S`), click the chat input, then `Ctrl+V`.
- **Drag:** drag a `.png`/`.jpg` into the chat input.
- **If paste does nothing** (a known Cursor bug on some Windows builds): save the image into the
  project, e.g. `refs/leave-form.png`, and type `@refs/leave-form.png` in the chat.
- **Timing:** attach it with your first prompt, or when intake item 2 asks for it (answer `2. 1`
  and attach it in the same message).
- **What happens next:** the agent writes a text transcription of the screenshot into
  `REQUIREMENTS.md` (later chats and the subagents can't see chat images). If you gave a file, it
  is copied to `.agent/work/<id>/refs/`.

## A. Greenfield run (`C:\PipelineDemo`)
Use a **new chat** for each step and select the mode shown.

### A1. First feature, from nothing (Plan mode)
Prompt (optionally with a screenshot of a form you like):
```
Build a leave request feature: employees submit leave requests and managers approve or reject them.
```
Expected:
- [ ] `Detected: Feature · Medium/High risk`, and it reads `.agent/memory/INDEX.md`.
- [ ] Reports **GREENFIELD** and the toolchains found (node, dotnet versions).
- [ ] Shows the **7-item intake**, each item pre-filled:
  1. Title: inferred, e.g. "Leave Request Management".
  2. Screenshot: uses yours if attached, otherwise offers paste / @file / match page / none.
  3. Features/sub-features: F1 Submit request (dates, type, reason), F2 Approve/Reject, F3 My
     requests list…
  4. Actors: Employee + Manager pre-selected.
  5. Rules: e.g. end date ≥ start date, managers can't approve their own requests; UNKNOWNs
     like a balance limit are asked as options.
  6. Data elements: a field table (EmployeeId, StartDate, EndDate, Type, Status, …).
  7. Folder structure: **stack options** (React SPA / ASP.NET Core API / full stack web+api /
     Python) with a proposed tree.
- [ ] Reply in shorthand, e.g. `1. ok 2. 4 3. 1 4. 1,2 5. 1 6. 1 7. 3`.
- [ ] The plan's step 1 is **scaffold + tooling** (typecheck/lint/test/build). It has steps with
  files and how each is verified, and lists risks.
- [ ] **No files are written until you click Build** (except the plan, if you choose *Save to
  workspace*).
- [ ] After Build: the artifacts are saved in `.agent/work/<date-slug>/`, the scaffold builds,
  and the feature is implemented with tests.
- [ ] **Review gate**: `validator`, `code-reviewer` and `security-auditor` run (you'll see 3
  subagent cards). `VALIDATION.md`, `REVIEW.md` and `SECURITY.md` are written. Any FAIL shows
  the `Validation failed` menu, and after fixes the failed reviewer is re-run.
- [ ] Docs in `docs/features/leave-requests.md`, plus a memory proposal (an ADR for the stack
  choice).
- [ ] The final report lists the checks, the review and security results, NOT RUN reasons, and
  risks.

> Note: Node 22.11 is too old for the newest Vite scaffolder. The pipeline's layout guide falls
> back to `create-vite@6.5.0`. If you see an engine error, that is what it should fix.

### A2. Second feature reuses the first (Plan mode)
`Add a manager dashboard showing pending leave requests per team.`
- [ ] Not greenfield any more. Item 7 shows the **existing** structure.
- [ ] Reuses the API client, DTOs and list components from A1. No parallel service.

### A3. Schema change (Plan mode)
`Add a half-day option to leave requests.`
- [ ] **High** risk: impact analysis (migration, existing rows, rollback) and explicit approval.
- [ ] Never runs `dotnet ef database update` without asking.

### A4. Bug (Debug mode)
Break something yourself (e.g. swap the approve/reject handlers), then:
`Approving a request marks it as rejected.`
- [ ] Reproduce → root cause → one-line fix → regression test → review gate.

### A5. Investigation (Ask mode)
`How is it enforced that only managers can approve?`
- [ ] Read-only (`git status` unchanged), with `file:line` references.

### A6. Quick lane (Agent mode)
`Change the page heading to "Leave Requests".`
- [ ] Low risk: no intake, no plan; edit → review gate.

## Record and tune
- Report problems as issues on the pipeline repo, with the chat transcript or the
  `.agent/work/<id>/` files attached.
- Common fixes:

  | Symptom | Fix |
  |---|---|
  | Codes before approval | Check that AGENTS.md is loaded; use Plan mode for features |
  | Intake skips items | Name the skill: `/requirements-intake` |
  | Reviewers don't run | Say `run the review gate`, or invoke `/code-reviewer`, `/security-auditor` |
  | Screenshot ignored | The model isn't vision-capable, or paste failed. Use `@file` |

- After editing any pipeline file in a project: `node scripts/check-pipeline.mjs`.

## Roll out to a real project
```powershell
node C:\tools\engineering-pipeline\scripts\install.mjs C:\path\to\repo --dry-run
node C:\tools\engineering-pipeline\scripts\install.mjs C:\path\to\repo
```
The installer never overwrites anything and lists conflicts for you to merge. Afterwards, fill
in `.agent/memory/conventions.md` and commit through a PR.
