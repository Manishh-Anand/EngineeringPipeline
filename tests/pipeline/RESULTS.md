# Pipeline self-test results

## Automated (Claude Code, 2026-10-17)
| Check | Result | Evidence |
|---|---|---|
| Quality gates (`node .agent/scripts/check-pipeline.mjs`) | PASS | "Pipeline check PASSED" |
| Linter and installer self-tests (`node --test scripts/pipeline.test.mjs`) | PASS | 8/8, including negative fixtures |
| samples/api build (warnings as errors) | PASS | 0 warnings, 0 errors |
| samples/api tests | PASS | 5/5 |
| SQL Server migration (LocalDB 2025) | PASS | Idempotent script applied twice to a temp DB; 3 seed rows; PK and IX present; DB dropped |
| samples/web typecheck / lint / test / build | PASS | 3/3 tests; build succeeded |
| Dependency gate | PASS | Build caught CVE-2026-84008 (transitive Pkcs 9.0.11); pinned the fix, 9.0.21 |

## Workflow scenarios in Cursor (fill in per `docs/TESTING_IN_CURSOR.md`)
| Scenario | Mode | Date / Cursor version | Result | Failed checks / notes |
|---|---|---|---|---|
| A React feature | Plan → Agent | | | |
| B ASP.NET Core feature | Plan → Agent | | | |
| C SQL Server change | Plan | | | |
| D Bug | Debug | | | |
| E Investigation | Ask | | | |
