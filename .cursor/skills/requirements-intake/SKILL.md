---
name: requirements-intake
description: Turn an unstructured feature or change request into structured requirements (EXPLICIT / INFERRED / UNKNOWN) and ask only high-impact, numbered multiple-choice questions. Use at the start of any Medium/High-risk feature or significant modification, before planning.
---
# Requirements intake

## Purpose
Convert a developer's request into `REQUIREMENTS.md` with as few questions as possible.

## Trigger
Full lane (AGENTS.md §4): a new feature, a significant modification, or a bug whose fix changes
behaviour.

## Inputs
- The prompt, plus any screenshots, mockups or reference links.
- `.agent/memory/INDEX.md`.
- A quick repo scan: manifests, routes, similarly named modules. Deep analysis is
  `codebase-audit`'s job.

## Process
1. Create `.agent/work/<YYYYMMDD-slug>/REQUIREMENTS.md` from `.agent/templates/REQUIREMENTS.md`.
2. Fill in every category and tag each value with its source:
   - `EXPLICIT`: the developer said it, or it is in an attached reference.
   - `INFERRED (<source>)`: deduced from the repo, docs, config, tests or memory. Always name the
     source, e.g. `INFERRED (package.json)`.
   - `UNKNOWN`: none of the above.
3. If a visual feature has no reference, ask for a screenshot or mockup once, as an option
   ("1) I'll attach one 2) Match existing page X 3) No visual reference").
4. Keep an UNKNOWN as a question **only if** its answer changes functionality, architecture,
   data, UX, security, API behaviour, DB schema or acceptance criteria. Otherwise choose a
   sensible default and record it as `INFERRED (default)`.
5. Ask all the remaining questions in **one** message, at most 5 per round:
   - numbered questions, each with numbered options plus `Other`;
   - put the recommended option first and mark it `(recommended)`;
   - add a one-line explanation where the options aren't self-evident;
   - say that answers can be given like `1. 2  2. 4 — use existing API`.
6. Record the answers as EXPLICIT. Every acceptance criterion must be testable (Given/When/Then
   or a checkable statement).
7. End with `Requirements complete.` and move to `codebase-audit`.

## Output
`REQUIREMENTS.md`, which is short and has a source tag on every line.

## Question quality
Bad: "What React component do you want me to use?" (the agent can find this out itself)

Good:
```
1. Table for the results
   1) Reuse ApplicationTable (recommended)
   2) Extend ApplicationTable with a risk column
   3) New table component
   4) Other
```

## Guardrails
- Never ask about something already stated, inferable, or an implementation detail the agent
  owns.
- Never invent business rules. A business rule nobody stated is UNKNOWN, even if one answer seems
  obvious.
- No more than 2 question rounds. After that, proceed with recorded assumptions and list them as
  Risks.

## Stop conditions
- The request is actually an investigation or a bug. Re-route as AGENTS.md §2 says.
- The request conflicts with a recorded decision in `.agent/memory/decisions/`. Show the conflict
  and ask.
