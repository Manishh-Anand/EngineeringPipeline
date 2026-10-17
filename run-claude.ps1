$ErrorActionPreference = "Stop"

$claude = "C:\Users\manis\.local\bin\claude.exe"
$repo = "C:\EngineeringPipeline"
$log = "C:\Users\manis\claude-overnight.log"

# ==================================================
# Helper
# ==================================================

function Write-Log {
    param([string]$Message)

    $Message | Tee-Object -FilePath $log -Append
}

# ==================================================
# Start
# ==================================================

Set-Location $repo

Write-Log "=================================================="
Write-Log "Claude overnight run started: $(Get-Date)"

# ==================================================
# 1. Verify Git branch
# ==================================================

$currentBranch = (git branch --show-current).Trim()

Write-Log "Current branch: $currentBranch"

if ($currentBranch -ne "sdd-pipeline") {

    Write-Log "Switching to sdd-pipeline..."

    git switch sdd-pipeline

    if ($LASTEXITCODE -ne 0) {
        Write-Log "ERROR: Could not switch to sdd-pipeline."
        exit 1
    }
}

Write-Log "Confirmed branch: $((git branch --show-current).Trim())"

# ==================================================
# 2. Verify clean working tree
# ==================================================

$existingChanges = git status --porcelain

if ($existingChanges) {

    Write-Log "ERROR: Repository contains uncommitted changes."
    Write-Log "Claude will NOT be started."

    Write-Log "Existing changes:"
    Write-Log $existingChanges

    exit 1
}

Write-Log "Working tree is clean."

# ==================================================
# 3. Claude prompt
# ==================================================

$prompt = @"

# Upgrade the Existing Agentic Coding Pipeline

You have already implemented the Agentic Coding Pipeline based on the previous PRD in this repository.

Do NOT rebuild it from scratch.

Your task is to inspect the existing implementation, understand it, and upgrade it where appropriate.

The goal is to evolve it into a lightweight Spec-Driven Development (SDD) workflow for Cursor, while preserving the existing design and keeping the system small, maintainable, context-efficient, and practical.

---

## 1. Inspect the Existing Implementation First

Before changing anything:

- Inspect the repository structure.
- Inspect .cursor/.
- Inspect all existing skills.
- Inspect all existing rules.
- Inspect the current workflow.
- Understand how the questionnaire works.
- Understand how Cursor native modes are being used.
- Inspect the existing installer/update mechanism.
- Identify what is already working well.
- Identify duplication.
- Identify unnecessary complexity.
- Identify missing capabilities.

Do NOT immediately rewrite anything.

Make an engineering assessment first and then decide what should actually change.

---

## 2. Preserve the Existing Questionnaire

This is a hard requirement.

The existing initial questionnaire is already implemented and must remain the foundation of the workflow.

Do NOT remove, replace, or unnecessarily redesign it.

Preserve all seven existing questionnaire items:

1. Title
2. Take Screenshot
3. Give Features/SubFeatures
4. Actors
5. Give Rules
6. Give Data Elements
7. Architecture Structure (Folder Structure)

The existing questionnaire should remain recognizable and usable.

You may improve its intelligence where appropriate, for example:

- infer answers from the repository;
- ask only genuinely missing questions;
- present choices as 1, 2, 3, Other;
- allow the agent to determine when a question is unnecessary.

Do not break the existing questionnaire UX merely to introduce SDD.

---

## 3. Introduce Spec-Driven Development

Evolve the existing workflow toward a lightweight SDD process.

Use the following conceptual flow:

Specify
↓
Clarify
↓
Plan
↓
Tasks
↓
Implement
↓
Validate
↓
Converge
↓
Document

Do NOT copy GitHub Spec Kit blindly.

Adopt only useful principles:

- specification before implementation;
- clarification;
- architecture-aware planning;
- explicit implementation tasks;
- consistency checking;
- validation;
- convergence against the original specification.

The objective is a lightweight engineering workflow, not a Spec Kit clone.

---

## 4. Evolve the Existing Pipeline

The desired workflow should approximately become:

Existing Questionnaire
↓
Infer Missing Information
↓
Clarify Only When Necessary
↓
Codebase / Architecture Audit
↓
Plan
↓
Implementation Tasks
↓
Consistency Check
↓
Human Approval
↓
Implementation
↓
Validation
↓
Convergence
↓
Documentation

Do NOT force every request through every stage.

A simple request should remain simple.

A large feature should receive the complete workflow.

A bug should use an appropriate debugging workflow.

An investigation should remain read-only.

Use engineering judgment to determine the appropriate workflow.

---

## 5. Cursor Native Modes Are Critical

Cursor compatibility is the most important requirement.

Do NOT recreate functionality that Cursor already provides natively.

Use Cursor's native capabilities appropriately:

Ask
→ repository investigation / read-only analysis

Plan
→ requirements analysis + implementation planning

Agent
→ implementation

Debug
→ bug investigation and fixing

Multitask
→ genuinely independent parallel work

The custom skills and rules should provide the engineering methodology and standards.

Cursor should provide the actual execution modes.

Do not create unnecessary custom abstractions that duplicate Cursor functionality.

---

## 6. Add a Tasks Stage

After the implementation plan, introduce a concise task breakdown.

Tasks should be:

- actionable;
- dependency-aware;
- related to the plan;
- related to the requirements.

Example:

T001 — Update database model
T002 — Add API endpoint
T003 — Add API tests
T004 — Add React API integration
T005 — Implement UI
T006 — Add UI tests
T007 — Run validation

Do not create meaningless micro-tasks.

---

## 7. Add Lightweight Consistency Checking

Before implementation, compare:

Questionnaire / Specification
↕
Plan
↕
Tasks
↕
Existing Architecture

Detect:

- missing requirements;
- contradictory requirements;
- missing tasks;
- architecture violations;
- unnecessary changes;
- missing validation considerations;
- missing database considerations.

Keep this lightweight.

---

## 8. Keep Human Approval

Before significant implementation, the agent should present a short plan and ask:

1. Approve and build
2. Modify the plan
3. Show more details
4. Cancel

Do not start major implementation before approval when operating interactively in Cursor.

Do not create a fake approval mechanism that duplicates Cursor's native interaction model.

---

## 9. Add Convergence

After implementation, the workflow should not only check whether code compiles.

It should compare:

Original requirements
↓
Actual implementation

Look for:

- missing features;
- incomplete requirements;
- architecture drift;
- unimplemented tasks;
- missing validation;
- unintended changes.

If something is missing, fix it or clearly report it.

---

## 10. Keep Skills and Rules Small

Do NOT create one huge SKILL.md containing the entire engineering process.

Keep skills:

- focused;
- modular;
- composable;
- concise.

Technology-specific rules should remain separate.

Use the existing repository structure where appropriate.

For example, technology-specific rules may include:

.cursor/
├── rules/
│   ├── engineering-core.mdc
│   ├── csharp-dotnet.mdc
│   ├── aspnet-core.mdc
│   ├── ef-core.mdc
│   ├── react.mdc
│   ├── typescript.mdc
│   ├── javascript.mdc
│   ├── vite.mdc
│   ├── sql-server.mdc
│   ├── python.mdc
│   ├── testing.mdc
│   └── security.mdc
│
└── skills/
    ├── requirements/
    ├── codebase-audit/
    ├── architecture-review/
    ├── planning/
    ├── tasks/
    ├── validation/
    ├── convergence/
    └── documentation/

Do NOT create these files blindly.

Reuse existing files whenever they already provide the required capability.

---

## 11. Preserve Technology Coverage

The system should continue supporting:

- C#
- ASP.NET Core
- Entity Framework Core
- SQL Server
- React
- TypeScript
- JavaScript
- JSX / TSX
- Vite
- Python

Keep coding standards modular and technology-aware.

---

## 12. External Skills

Review the external skills already included in the implementation.

You may evaluate useful skills from sources such as:

- Vercel Agent Skills
- frontend/design skills
- testing skills
- security skills
- Ponytail
- Caveman
- other mature engineering skills

Do NOT add skills simply because they exist.

For every candidate skill determine:

- Does it provide unique value?
- Does it duplicate an existing skill?
- Does it increase context unnecessarily?
- Does it conflict with our standards?
- Is it relevant to our stack?

Only retain/add skills that genuinely improve the system.

---

## 13. Context Efficiency

The entire system should follow:

Progressive context loading rather than maximum context loading.

For example:

A React task should not unnecessarily load SQL Server, Python and ASP.NET rules.

A large feature should be decomposed into smaller feature units rather than forcing the entire feature into one context.

Context efficiency is a first-class engineering requirement.

---

## 14. Team Consistency

The ultimate goal is:

Two developers giving the agent the same type of request should receive a consistent engineering process and quality bar.

Standardize:

Requirements
Planning
Architecture review
Tasks
Implementation
Validation
Documentation

without forcing every project to have identical architecture.

Project architecture always takes precedence over generic assumptions.

---

## 15. Engineering Judgment

This is extremely important.

Do NOT blindly follow this document.

If the existing implementation already solves something correctly:

KEEP IT.

If something here would make the system more complex without meaningful benefit:

DO NOT IMPLEMENT IT.

If two mechanisms overlap:

SIMPLIFY THEM.

If Cursor native functionality already solves a problem:

USE CURSOR rather than rebuilding it.

The goal is not to create more files, skills, agents, or prompts.

The goal is to create a small, robust, maintainable, context-efficient and consistent engineering workflow.

---

## 16. Existing scripts directory change

The pipeline currently uses scripts/check-pipeline.mjs.

Move the pipeline-specific script to:

.agent/scripts/check-pipeline.mjs

Do NOT use .cursor/ for this because .cursor/ is Cursor's configuration space.

Ensure the change is handled comprehensively across:

- installer
- documentation
- CI snippet
- update logic
- existing-install migration

Existing project scripts must not be unnecessarily overwritten or mixed with pipeline-specific files.

---

## 17. Validation Requirement

IMPORTANT:

Do NOT run the project's actual test suites during this unattended run.

Instead, after implementing the changes, create a Markdown validation document:

OVERNIGHT_VALIDATION.md

The document must contain exactly three representative validation scenarios covering the most important parts of the upgraded pipeline.

For each scenario include:

1. Scenario name
2. Purpose
3. Starting condition
4. User/request input
5. Expected workflow
6. Expected Cursor mode
7. Expected output
8. What should be verified manually

The three scenarios should collectively validate:

1. A normal feature request using the SDD workflow.
2. A bug/debugging request using Cursor's native Debug capability.
3. A repository investigation/read-only request using Cursor's native Ask capability.

Do not execute these tests.

The Markdown file is a validation/test plan for later manual verification in Cursor.

---

## 18. Final Review

Before finishing:

- inspect all changes;
- review the Git diff;
- remove unnecessary files;
- remove duplicate skills/rules;
- check Cursor compatibility;
- check installer/update consistency;
- check documentation consistency;
- verify the seven-question questionnaire remains intact;
- verify the SDD workflow is actually represented in the implementation;
- verify .agent/scripts/check-pipeline.mjs is handled correctly;
- verify OVERNIGHT_VALIDATION.md exists and contains the three scenarios.

Do not make unrelated changes.

---

## Acceptance Criteria

The upgrade is complete only if:

### Architecture

- Existing implementation was inspected before modification.
- Working components were not unnecessarily replaced.
- Cursor remains the execution platform.

### SDD

- Specification exists.
- Clarification exists.
- Planning exists.
- Tasks exist.
- Implementation exists.
- Validation exists.
- Convergence exists.
- Documentation exists.

### Questionnaire

All seven existing questionnaire items remain supported:

1. Title
2. Take Screenshot
3. Give Features/SubFeatures
4. Actors
5. Give Rules
6. Give Data Elements
7. Architecture Structure (Folder Structure)

### Cursor

- Ask is used for read-only investigation.
- Plan is used for meaningful planning.
- Agent performs implementation.
- Debug handles appropriate bugs.
- Multitask is used only for genuinely independent work.
- Native Cursor functionality is not unnecessarily recreated.

### Context

- Skills remain small.
- Rules remain small.
- Technology-specific rules are modular.
- Relevant context is loaded selectively.
- Large features can be decomposed.

### Quality

- Requirements are checked.
- Architecture is checked.
- Validation is defined.
- Build considerations are checked where appropriate.
- Security is considered.
- Implementation is compared against specification.

### Team Consistency

- Repository-native distribution remains supported.
- Existing standards are preserved.
- External skills are evaluated rather than blindly copied.

---

## Final Principle

First inspect → assess → make an engineering judgment → implement → review → refine.

Do not stop after the assessment.

The final result should feel like a mature internal AI engineering system, not a collection of prompt files.

Most importantly, optimize for:

1. Cursor compatibility
2. Simplicity
3. Context efficiency
4. Maintainability
5. Consistency
6. Correctness

Do not add complexity merely to make the architecture appear more sophisticated.

"@

# ==================================================
# 4. Run Claude Code
# ==================================================

Write-Log "Starting Claude Code..."

& $claude -p $prompt 2>&1 | ForEach-Object {
    $_ | Tee-Object -FilePath $log -Append
}

$claudeExitCode = $LASTEXITCODE

Write-Log "Claude exit code: $claudeExitCode"

# ==================================================
# 5. Stop if Claude failed
# ==================================================

if ($claudeExitCode -ne 0) {
    Write-Log "Claude failed or could not run."
    Write-Log "Git push will NOT be attempted."
    exit $claudeExitCode
}

Write-Log "Claude completed successfully."

# ==================================================
# 6. Check Git changes
# ==================================================

$status = git status --porcelain

if (-not $status) {
    Write-Log "Claude completed but no Git changes were detected."
    Write-Log "Nothing to commit."
    exit 0
}

Write-Log "Changes detected:"
Write-Log $status

# ==================================================
# 7. Commit
# ==================================================

Write-Log "Adding changes..."

git add -A

if ($LASTEXITCODE -ne 0) {
    Write-Log "ERROR: git add failed."
    exit 1
}

Write-Log "Creating commit..."

git commit -m "Upgrade agentic pipeline to SDD workflow"

if ($LASTEXITCODE -ne 0) {
    Write-Log "ERROR: git commit failed."
    exit 1
}

# ==================================================
# 8. Push
# ==================================================

Write-Log "Pushing to origin/sdd-pipeline..."

git push origin sdd-pipeline

if ($LASTEXITCODE -ne 0) {
    Write-Log "ERROR: git push failed."
    exit 1
}

Write-Log "SUCCESS: Changes committed and pushed to sdd-pipeline."
Write-Log "Claude run finished: $(Get-Date)"
Write-Log "=================================================="