---
name: audited-api-test-workflow
description: "Build auditable Postman/Newman API contract tests from requirements and a runnable SUT. Use when an assignment or review requires AI-generated cases, explicit human oracle decisions, human-added cases, deterministic execution evidence, defect grouping, and traceable AI-use records."
---

# Audited API Test Workflow

Follow this sequence for each independently counted endpoint.

1. Extract only explicit requirements and invariants. Inspect the implementation to plan fixtures, but never replace the required contract with current behavior.
2. Generate at least the required number of AI cases. Give every case a stable ID and record scenario, input/steps, and expected result.
3. Classify every generated case as `VALID`, `INVALID`, or `INCOMPLETE`. Ask the student to decide every material unspecified oracle. Never silently choose status codes, uniqueness, normalization, limits, authorization, or deletion policy.
4. Preserve incomplete cases as observations. Do not report either possible outcome as a defect.
5. Add the required human-selected cases separately and state why the generated set missed them.
6. Build deterministic fixtures. Start the SUT before seeding if startup recreates the database. Isolate stateful cardinality cases into separate fixture runs when necessary.
7. Insert the required attribution header through a collection-level pre-request script and log it. Run `scripts/validate_collection.js` before execution.
8. Compile generated Postman scripts before Newman where possible. If a harness defect appears, reject that run, correct the test, reset the fixture, and rerun the entire affected scope.
9. Save HTML evidence in the submission tree and raw Newman JSON outside it when the submission rules do not require raw data. Run `scripts/summarize_newman.js` to obtain reproducible totals and failing IDs.
10. Group failures by root cause. Separate confirmed requirement defects from security-hardening observations and unspecified behavior.
11. Restore the original database, update the AI audit, and commit generated cases, human audit, human additions, and execution evidence as distinct milestones.

Read [oracle-checklist.md](references/oracle-checklist.md) before auditing cases. Use it to identify questions that require student authority.

## Evidence rules

- Every reported count must come from Newman JSON, not manual estimation.
- Never fabricate screenshots, CI results, GitHub Issues, video, or pass/fail evidence.
- A failed assertion is evidence only when its fixture, request, and oracle are valid.
- Include the SUT commit, run date, runner version, fixture summary, HTTP-request count, assertion totals, and rejected-run notes.
- Keep secrets, database backups, and bulky diagnostic JSON outside the submission tree.
