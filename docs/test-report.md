# HW06 API Testing Report

## Submission identity and scope

- Student ID: `23127414`
- SUT: `ttbhanh/eshop-sut` at commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`
- Tools: Postman and Newman 6.2.2
- Required attribution: collection-level script inserts and logs `X-Student-Id: 23127414`
- Selected features: FR-01 Account Registration, FR-11 User Order History, and all four FR-14 Category CRUD endpoints

## Coverage and execution summary

| Endpoint | AI | Human | Cases | Requests | Assertions passed | Assertions failed | Failing cases | Defect candidates |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `POST /api/register` | 40 | 5 | 45 | 155 | 54 | 30 | 29 | 4 |
| `GET /api/orders/my-orders` | 40 | 7 | 47 | 71 | 35 | 14 | 14 | 5 |
| `GET /api/categories` | 40 | 6 | 46 | 75 | 47 | 1 | 1 | 1 |
| `POST /api/categories` | 40 | 7 | 47 | 93 | 32 | 25 | 25 | 5 |
| `PUT /api/categories/:id` | 40 | 7 | 47 | 75 | 30 | 29 | 29 | 6 |
| `DELETE /api/categories/:id` | 40 | 7 | 47 | 116 | 49 | 37 | 24 | 6 |
| **Total** | **240** | **39** | **279** | **585** | **247** | **136** | **122** | **27** |

The 279-case interpretation follows the student's explicit decision that the minimum applies independently to every endpoint. Seven FR-11 setup items are excluded from case counts but their HTTP requests are included in execution totals.

## Human audit summary

| Endpoint | VALID | INVALID and corrected | INCOMPLETE observation | Total AI cases |
| --- | ---: | ---: | ---: | ---: |
| FR-01 Register | 33 | 3 | 4 | 40 |
| FR-11 Order History | 36 | 2 | 2 | 40 |
| FR-14 GET | 34 | 0 | 6 | 40 |
| FR-14 POST | 38 | 0 | 2 | 40 |
| FR-14 PUT | 38 | 0 | 2 | 40 |
| FR-14 DELETE | 40 | 0 | 0 | 40 |
| **Total** | **219** | **5** | **16** | **240** |

Invalid AI cases were corrected during human review before implementation. Incomplete cases were executed only as observations and did not independently establish defects.

## Principal findings

1. Registration lacks server-side name, email, and password validation; duplicate emails are accepted; credentials are exposed in plaintext; parser errors disclose internal paths.
2. Order history exposes fields outside the approved schema, accepts malformed authorization schemes, authorizes deleted principals, trusts semantically invalid JWT claims, and is exploitable with the hard-coded signing secret.
3. Category GET meets almost all selected behavior but ignores the approved `Accept: text/html → 406` rule.
4. Category POST and PUT do not validate or normalize names and do not enforce admin-only authorization.
5. Category PUT and DELETE report success for nonexistent or malformed IDs because affected-row counts are not checked.
6. Category DELETE permits orphaned products and ignores forbidden body/media input.

Detailed evidence, affected IDs, actual/expected results, and severity proposals are in each endpoint's `execution-results.md` and in `docs/bug-summary.md`.

## Reproducibility controls

- The SUT is pinned to a full commit SHA.
- Stateful cases use deterministic SQLite fixtures prepared only after server startup.
- Cardinality-sensitive GET/DELETE cases run in separate fixture modes.
- Database backups are stored outside the submission repo and restored after every run.
- Generated Postman scripts are compiled before execution where possible.
- One invalid POST harness run was rejected, corrected, reset, and rerun; it is not included in totals.
- HTML Newman reports are committed; raw JSON stays under the local `.runtime` diagnostics directory.

## CI and Agent Skill

- CI contains a small known-good smoke collection so genuine full-suite conformance failures are not relabeled as passing behavior.
- Public pass/fail run links are recorded in `docs/ci-evidence.md`, and the final branch is restored to green.
- `agent-skill/audited-api-test-workflow` packages the audit and evidence process. Its structure and scripts were validated against this submission.
- The complete truthful list of exercised Postman/Newman features is in `docs/postman-features.md`.
- Generator pseudocode is in `docs/agent-skill-pseudocode.md`; the companion diagram remains student-owned.

## Remaining student-owned evidence

The following cannot be fabricated by automation and must be completed by the student:

- draw the required test-generator diagram personally;
- record the Agent Skill demonstration video;
- capture GitHub Issue/Newman/CI screenshots through a connected browser and attach them to the relevant issues;
- select the final self-assessed grade after checking the official rubric.
