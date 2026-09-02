# FR-14 PUT Category — Execution Results

## Run metadata

| Field | Value |
| --- | --- |
| Date | 2026-09-03 |
| Runner | Newman 6.2.2 with htmlextra and JSON reporters |
| SUT | Teacher repository commit `85af3ba875c88283615e22cb108f13e2fccaf0e9` |
| Host | `http://localhost:3000` |
| Required header | `X-Student-Id: 23127414`, inserted by collection pre-request script |
| Fixture | 48 isolated categories and one product sentinel referencing category ID 47 |

Every ordinary case targeted its own fixture ID so earlier mutations could not invalidate later preconditions. Test scripts were compiled before execution. The original database was restored afterward.

## Result summary

| Metric | Result |
| --- | ---: |
| FR-14 PUT test cases executed | 47 |
| Total HTTP requests | 75 |
| Assertions | 59 |
| Assertions passed | 30 |
| Assertions failed | 29 |
| Cases with no failed assertion | 18 |
| Cases with at least one failed assertion | 29 |
| Test-script syntax/runtime failures | 0 |

Failing case IDs: `FR14PUT-AI-007`–`020`, `022`–`027`, `029`, `032`–`034`, `040`, and `FR14PUT-H-001`–`004`.

The attributable HTML report is stored in `reports/newman/fr14-put.html`. Raw JSON diagnostics are retained outside the submission tree under `.runtime/fr14put`.

## Confirmed defect candidates

### BUG-FR14PUT-001 — Update does not validate or normalize `name`

- Surrounding whitespace was not trimmed.
- Blank, missing, empty, null, numeric, boolean, object, and array names all returned 200.
- Extra fields, including a prototype-shaped field, were ignored instead of returning 400.
- Affected cases: `FR14PUT-AI-007`–`017`, `034`, `FR14PUT-H-003`, and `004`.
- Severity proposal: High.

### BUG-FR14PUT-002 — Parser/media errors expose internals or return 500

- Malformed JSON exposed local `node_modules` parser paths in an HTML error page.
- `text/plain` and form bodies caused unhandled destructuring failures and HTTP 500 instead of 415.
- Affected cases: `FR14PUT-AI-018`–`020`.
- Severity proposal: High.

### BUG-FR14PUT-003 — Nonexistent and invalid IDs falsely report success

- Positive nonexistent ID 9999 returned 200 instead of 404.
- Zero, negative, decimal, alphabetic, and SQL-like IDs returned 200 instead of 400.
- No row was created, so the success message misrepresents the database result.
- Affected cases: `FR14PUT-AI-022`–`027`.
- Severity proposal: Medium.

### BUG-FR14PUT-004 — Update does not enforce admin authorization

- A normal-user JWT updated categories successfully, including with query/header role-spoof values.
- A forged/stale JWT claiming admin for the normal-user account was accepted without a database role check.
- Affected cases: `FR14PUT-AI-032`, `033`, `FR14PUT-H-001`, and `002`.
- Severity proposal: Critical.

### BUG-FR14PUT-005 — Empty Authorization is classified inconsistently

- Empty Authorization returned 403 instead of the approved 401.
- Affected case: `FR14PUT-AI-029`.
- Severity proposal: Low.

### BUG-FR14PUT-006 — PUT ignores unacceptable response media type

- `Accept: text/html` returned 200 and mutated the row instead of returning 406 without mutation.
- Affected case: `FR14PUT-AI-040`.
- Severity proposal: Low.

## Passing behavior and observations

- Normal, Unicode, one-character, duplicate, XSS-like, and SQL-like literal names updated exactly one existing ID.
- The exact success body was `{"message":"Category updated"}`.
- Concurrent renames left one row whose final value was one submitted name; ordering was not treated as specified.
- Idempotent replay preserved one row and one ID.
- The update/delete race ended with the row absent, and updating category ID 47 did not change its product's `category_id` or fields.
- 255- and 256-character names were accepted; these remain observations.

GitHub Issues remain pending until real screenshots can be attached.
