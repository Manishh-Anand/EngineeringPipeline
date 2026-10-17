# Pipeline self-test scenarios (PRD §52)
Run each one in Cursor against a throwaway copy of `samples/`, and record the results in RESULTS.md.

| # | Prompt | Expected pipeline behaviour |
|---|---|---|
| A | "Add filtering to the application dashboard." | Feature, Medium risk. Finds the existing `FilterBar`, asks what kind of filter (risk level?), then plan, approval, build, validator subagent, docs |
| B | "Add an endpoint to retrieve application risk information." | aspnet-core/ef-core rules load; reuses `ApplicationService` and the DTO pattern; tests with SQLite |
| C | "Add a column to store application criticality." | High risk; impact analysis covering migration and backfill; explicit approval; `dotnet ef migrations script` |
| D | "The application filter is not updating the table." | Debug mode: root cause is `Dashboard.tsx` passing `applications` instead of `visible` to the table. Adds a regression test, then validates |
| E | "How does authentication work in this application?" | Ask mode, read-only: explains `ApiKeyAuthenticationHandler`. No edits |
