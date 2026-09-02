# FR-01 Registration — Execution Results

## Run metadata

| Field | Value |
| --- | --- |
| Date | 2026-09-02 |
| Runner | Newman 6.2.2 with htmlextra reporter |
| SUT | Teacher repository commit `85af3ba875c88283615e22cb108f13e2fccaf0e9` |
| Host | `http://localhost:3000` |
| Required header | `X-Student-Id: 23127414` inserted by collection pre-request script |
| Database | Fresh deterministic seed; pre-run database restored afterward |

## Result summary

| Metric | Result |
| --- | ---: |
| Test cases/items executed | 45 |
| HTTP requests executed | 155 |
| Assertions executed | 84 |
| Assertions passed | 54 |
| Assertions failed | 30 |
| Test cases with no failed assertion | 16 |
| Test cases with at least one failed assertion | 29 |

Passing case IDs: `FR01-AI-001`–`005`, `011`–`013`, `023`–`026`, `032`, `040`, `FR01-H-004`, and `FR01-H-005`.

Failing case IDs: `FR01-AI-006`–`010`, `014`–`022`, `027`–`031`, `033`–`039`, `FR01-H-001`, `FR01-H-002`, and `FR01-H-003`.

The detailed attributable output is stored in `reports/newman/fr01-newman-report.html`. A raw JSON result was retained outside the submission tree under `.runtime/fr01` for local diagnostics.

## Confirmed defect candidates

### BUG-FR01-001 — Registration performs no server-side field validation

- Evidence: invalid/missing/null names, malformed emails, and weak/missing/null passwords all returned HTTP 200 and inserted accounts.
- Affected cases: `FR01-AI-006`–`010`, `014`–`021`, `027`–`031`, `033`–`036`, and `FR01-H-002`.
- Expected: HTTP 400 and no account creation.
- Actual: HTTP 200 with success schema and a new numeric user ID.
- Severity proposal: High.

### BUG-FR01-002 — Email uniqueness is not enforced atomically

- Evidence: exact duplicate and concurrent duplicate registrations both succeeded.
- Affected cases: `FR01-AI-022`, `FR01-H-001`.
- Expected: one account only; subsequent/racing duplicate returns HTTP 409.
- Actual: each request returned HTTP 200 and created another account.
- Severity proposal: High.

### BUG-FR01-003 — Password is stored/exposed as plaintext

- Evidence: after registration, the login response returned a `user.password` property equal to the submitted password.
- Affected case: `FR01-AI-037`.
- Violated requirement: SEC-01; response also leaks a credential value.
- Severity proposal: Critical.

### BUG-FR01-004 — Parser errors disclose internal stack paths and unsupported media returns 500

- Evidence: malformed JSON returned HTTP 400 but included local `node_modules` stack paths; `text/plain` caused HTTP 500 and another stack disclosure.
- Affected cases: `FR01-AI-038`, `FR01-AI-039`.
- Expected: safe HTTP 400/415 response without implementation details.
- Severity proposal: High.

## Observations not yet reported as specification bugs

- `FR01-AI-003`–`005`: the SUT accepted one-, 255-, and 256-character names; the specification defines no length oracle.
- `FR01-AI-025`: the XSS-like name was stored. UI output encoding must be checked before claiming an SEC-04 defect.
- `FR01-H-003`: dangerous object keys were accepted, but this run did not demonstrate prototype pollution or privilege escalation.
- `FR01-H-005`: 0 of 100 burst requests returned 429. Rate limiting is a hardening gap because the supplied requirements define no threshold.

GitHub Issues and screenshots remain pending; they must be created from real evidence rather than fabricated artifacts.
