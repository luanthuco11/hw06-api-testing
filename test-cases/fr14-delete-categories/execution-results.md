# FR-14 DELETE Category — Execution Results

## Run metadata

| Field | Value |
| --- | --- |
| Date | 2026-09-03 |
| Runner | Newman 6.2.2 with htmlextra and JSON reporters |
| SUT | Teacher repository commit `85af3ba875c88283615e22cb108f13e2fccaf0e9` |
| Host | `http://localhost:3000` |
| Required header | `X-Student-Id: 23127414`, inserted by collection pre-request script |
| Fixtures | One-category state plus an independent 80-category state with two product references |

The single-category case was executed separately so its empty-list postcondition was real. The other 46 cases used a deterministic multi-row fixture. Test scripts were compiled before execution, and the original database was restored afterward.

## Result summary

| Metric | Result |
| --- | ---: |
| FR-14 DELETE test cases executed | 47 |
| Total HTTP requests | 116 |
| Assertions | 86 |
| Assertions passed | 49 |
| Assertions failed | 37 |
| Cases with no failed assertion | 23 |
| Cases with at least one failed assertion | 24 |
| Test-script syntax/runtime failures | 0 |

Failing case IDs: `FR14DELETE-AI-007`–`013`, `015`, `019`, `024`–`026`, `028`, `029`, `031`, `036`–`038`, `FR14DELETE-H-001`–`003`, and `005`–`007`.

HTML evidence is stored in `reports/newman/fr14-delete-single.html` and `reports/newman/fr14-delete-main.html`. Raw JSON diagnostics are retained outside the submission tree under `.runtime/fr14delete`.

## Confirmed defect candidates

### BUG-FR14DELETE-001 — IDs and affected-row counts are not validated

- Nonexistent positive IDs, zero, negative, decimal, alphabetic, SQL-like, and very large IDs all returned the success contract.
- `%2B15` was coerced by SQLite and deleted real category ID 15 despite the approved 400 oracle.
- A 4,096-digit ID also returned 200.
- Repeating or concurrently issuing the same delete returned success every time; no request returned 404 after the first deletion.
- Affected cases: `FR14DELETE-AI-007`–`013`, `015`, `028`, `029`, and `FR14DELETE-H-007`.
- Severity proposal: High because noncanonical input can select and delete an unintended valid row.

### BUG-FR14DELETE-002 — Delete does not enforce admin authorization

- A normal-user JWT deleted categories, including requests containing role-spoof query/header values.
- Forged/stale admin claims and even a signed token with no role claim were accepted.
- Affected cases: `FR14DELETE-AI-024`–`026`, `FR14DELETE-H-001`–`003`.
- Severity proposal: Critical.

### BUG-FR14DELETE-003 — Referenced category is deleted and leaves orphan products

- Deleting category ID 31 returned 200 and removed the row even though fixture product ID 1 referenced it.
- Expected: 409 and no deletion.
- Affected case: `FR14DELETE-AI-031`.
- Severity proposal: High.

### BUG-FR14DELETE-004 — Unexpected bodies and media types are ignored

- Conflicting `id` fields and prototype-shaped body fields returned 200 and deleted the path target instead of returning 400.
- A `text/plain` body returned 200 and deleted the target instead of returning 415.
- Affected cases: `FR14DELETE-AI-036`, `037`, `FR14DELETE-H-005`, and `006`.
- Severity proposal: Medium.

### BUG-FR14DELETE-005 — Empty Authorization is classified inconsistently

- Empty Authorization returned 403 instead of the approved 401.
- Affected case: `FR14DELETE-AI-019`.
- Severity proposal: Low.

### BUG-FR14DELETE-006 — DELETE ignores unacceptable response media type

- `Accept: text/html` returned 200 and deleted the target instead of returning 406 without mutation.
- Affected case: `FR14DELETE-AI-038`.
- Severity proposal: Low.

## Passing behavior

- Existing targets, including the only row and one of two duplicate-name rows, were deleted by exact ID with the approved success schema.
- Missing/extra route segments were 404, missing and malformed bearer credentials were controlled, and a two-token smuggling value was rejected without deletion.
- An empty JSON object was allowed, unknown `force=true` did not broaden the target, and CORS preflight caused no mutation.
- Ten distinct concurrent target IDs were removed, unrelated product references remained stable, and deleted rows did not reappear after repeated GETs.

GitHub Issues remain pending until real screenshots can be attached.
