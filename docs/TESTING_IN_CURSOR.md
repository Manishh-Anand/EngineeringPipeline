# Testing the pipeline in Cursor

About 30–45 minutes for all five scenarios. You need Cursor 2.4 or later (for subagents), Node
22, the .NET 10 SDK, and optionally SQL Server LocalDB.

## 1. Prepare a throwaway workspace
Work on a copy so the template repo stays clean:
```powershell
git clone C:\EngineeringPipeline C:\Temp\pipeline-test
cd C:\Temp\pipeline-test\samples\web; npm ci
cd ..\api; dotnet tool restore; dotnet build
cd ..\..; git checkout -b scenario-run
cursor .
```

## 2. Confirm Cursor picked everything up
Open **Cursor Settings → Rules, Skills, Subagents** (shown as *Customize* in newer builds).

| Check | Expected |
|---|---|
| Project rules | 13 rules. `engineering-core` and `security` are **Always**; the other 11 are **Auto Attached** with globs |
| Skills | 13 skills: 6 internal plus 7 vendored. `caveman` and `ponytail` are marked manual-only |
| Subagents | `validator` |
| MCP (Settings → MCP) | `context7` and `playwright` listed. Enable them; the first start downloads them through npx |
| AGENTS.md | Included automatically. Open a new chat and ask *"What workflow do you follow in this repo?"* The answer should describe the lanes and the approval gate |

If skills don't appear, reload the window (`Ctrl+Shift+P` → *Developer: Reload Window*).

## 3. Run the scenarios
Start a **new chat for each scenario** (it's a fresh context, the same as a new developer would
have). Select the mode shown, paste the prompt, and tick the checks.

### A. React feature (Plan mode, then Agent)
Prompt: `Add filtering to the application dashboard.`

- [ ] Starts with a line like `Detected: Feature · Medium risk`
- [ ] Reads `.agent/memory/INDEX.md`
- [ ] Finds the existing `FilterBar`, `ApplicationTable` and `useApplications` and says so (reuse)
- [ ] Asks 1–5 **numbered multiple-choice** questions (e.g. which filter: risk level / owner / both)
- [ ] Doesn't ask anything the repo already answers (stack, test framework)
- [ ] Writes `.agent/work/<date-slug>/REQUIREMENTS.md`, `CODEBASE_CONTEXT.md` and `PLAN.md`
- [ ] The plan follows the template, with steps naming files plus a verification for each
- [ ] **Doesn't edit code before you click Build** (check: `git status` shows only `.agent/work`)
- [ ] After Build: `react.mdc`/`typescript.mdc` are applied, and a test is added
- [ ] The validator subagent runs `npm run typecheck`, `lint`, `test` and `build`, and writes `VALIDATION.md`
- [ ] Updates or creates `docs/features/…`, then gives a final report with NOT RUN reasons where relevant

### B. ASP.NET Core feature (Plan mode, then Agent)
Prompt: `Add an endpoint to retrieve application risk information.`

- [ ] Uses the existing minimal-API style (`Endpoints/ApplicationEndpoints.cs`), not a new controller
- [ ] Reuses `ApplicationService` and the DTO record pattern. No new DbContext, no repository layer
- [ ] The endpoint is in the group that `RequireAuthorization()` covers
- [ ] Tests go in `Sample.Api.Tests` using `ApiFactory` (SQLite)
- [ ] Validation runs `dotnet build` and `dotnet test`

### C. SQL Server change (Plan mode)
Prompt: `Add a column to store application criticality.`

- [ ] Classified as **High** risk
- [ ] The plan has an impact analysis: readers and writers, NOT NULL default or backfill, locking, rollback
- [ ] Asks whether criticality differs from the existing `RiskLevel` (a business-rule UNKNOWN)
- [ ] Proposes an EF migration (`dotnet ef migrations add …`) and reviewing `dotnet ef migrations script`
- [ ] Doesn't run `dotnet ef database update` without explicit approval
- [ ] Explicit approval is required before any edit

### D. Bug (Debug mode)
Prompt: `The application filter is not updating the table.`

- [ ] Reproduces first: a failing test, or a clear repro
- [ ] Root cause: `src/pages/Dashboard.tsx` passes `applications` to `<ApplicationTable>` instead of `visible`
- [ ] Fixes the root cause (one line) rather than patching `ApplicationTable`
- [ ] Adds a regression test that fails without the fix
- [ ] Validation runs and passes, and a gotcha memory entry may be proposed

### E. Investigation (Ask mode)
Prompt: `How does authentication work in this application?`

- [ ] Read-only: `git status` is unchanged afterwards
- [ ] Explains `ApiKeyAuthenticationHandler`: the `X-Api-Key` header, fixed-time comparison,
  fail-closed when the key isn't configured, `RequireAuthorization()` on the endpoint group, the
  key coming from `Auth__ApiKey`, and the Vite proxy adding the header server-side
- [ ] Gives file references

### Extra checks (optional)
- **Quick lane:** in Agent mode, `Change the dashboard heading to "Application Risk Overview".`
  It should be Low risk: no questions and no plan, straight to the edit and validation.
- **Scope protection:** during A, ask it to also "add a backend endpoint for filters". You should
  get the `STOP` menu.
- **Opt-in skills:** `/caveman` and `/ponytail` load only when you type them.

## 4. Record the results
Fill in `tests/pipeline/RESULTS.md`: one row per scenario with pass/fail per check, plus notes.
Copy the interesting `.agent/work/*` artifacts into `tests/pipeline/runs/<scenario>/` if you want
to keep them (`.agent/work` is gitignored).

## 5. If a check fails
| Symptom | Likely fix |
|---|---|
| Codes immediately in Plan or Agent | Make sure `AGENTS.md` is loaded (step 2). Tighten §6 of `AGENTS.md` |
| Wrong technology rules | Adjust the `globs` in the rule's frontmatter |
| A skill never triggers | Its `description` is too vague. Add the user's wording to it |
| Validation done inline | Mention it explicitly in AGENTS.md §4, or invoke `/validator` |
| Too many questions | Tighten step 4 of `requirements-intake` |

After any edit, run `node scripts/check-pipeline.mjs` and `node --test scripts/pipeline.test.mjs`.

## 6. Roll out to a real project
```powershell
node C:\EngineeringPipeline\scripts\install.mjs C:\path\to\real-repo --dry-run
node C:\EngineeringPipeline\scripts\install.mjs C:\path\to\real-repo
```
The installer never overwrites anything and lists conflicts, e.g. an existing `AGENTS.md`, for
you to merge. Then:
1. Fill in `.agent/memory/conventions.md`.
2. Run the checker.
3. Commit through a PR.
