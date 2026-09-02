# FR-14 GET Categories — Execution Results

## Run metadata

| Field | Value |
| --- | --- |
| Date | 2026-09-03 |
| Runner | Newman 6.2.2 with htmlextra and JSON reporters |
| SUT | Teacher repository commit `85af3ba875c88283615e22cb108f13e2fccaf0e9` |
| Host | `http://localhost:3000` |
| Required header | `X-Student-Id: 23127414`, inserted by collection pre-request script |
| Fixtures | Independent 0, 1, 3, 100, 13-row adversarial, and 10,000-row category states |

The SUT was started before every database fixture was prepared because its startup routine recreates SQLite. Each cardinality-sensitive folder was then run against exactly its documented state. The pre-run database was restored after execution.

## Result summary

| Metric | Result |
| --- | ---: |
| FR-14 GET test cases executed | 46 |
| Total HTTP requests | 75 |
| Assertions | 48 |
| Assertions passed | 47 |
| Assertions failed | 1 |
| Cases with no failed assertion | 45 |
| Cases with at least one failed assertion | 1 |

Failing case ID: `FR14GET-AI-036`.

Six attributable HTML reports are stored under `reports/newman/fr14-get-*.html`. Raw JSON diagnostics are retained outside the submission tree under `.runtime/fr14get`.

## Confirmed defect candidate

### BUG-FR14GET-001 — Endpoint ignores an unacceptable response media type

- Request: `GET /api/categories` with `Accept: text/html`.
- Student-approved expected result: HTTP 406 and no HTML response.
- Actual result: HTTP 200 with the complete JSON category array.
- Affected case: `FR14GET-AI-036`.
- Impact: the endpoint does not enforce the explicitly selected content-negotiation contract. No HTML injection was observed.
- Severity proposal: Low.

## Observations

- Empty and null names inserted directly into SQLite were serialized without crashing. These are corrupt-state observations, not defects against an unspecified recovery contract.
- Express emitted an ETag; the conditional follow-up returned a valid 304 or 200 response as allowed by the incomplete oracle.
- Cache headers and response times were recorded without inventing a policy or SLA.
- The 10,000-row list returned every unique ID and all three sentinels without truncation.
- Stored CRLF/control characters remained escaped JSON data and did not create an `X-HW06-Injected` response header.

The GitHub Issue remains pending until a real screenshot can be attached.
