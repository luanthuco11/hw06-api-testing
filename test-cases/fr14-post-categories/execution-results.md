# FR-14 POST Categories — Execution Results

## Run metadata

| Field | Value |
| --- | --- |
| Date | 2026-09-03 |
| Runner | Newman 6.2.2 with htmlextra and JSON reporters |
| SUT | Teacher repository commit `85af3ba875c88283615e22cb108f13e2fccaf0e9` |
| Host | `http://localhost:3000` |
| Required header | `X-Student-Id: 23127414`, inserted by collection pre-request script |
| Fixture | Empty deterministic category table; seeded admin ID 1 and normal user ID 2 |

The first attempted run was rejected because four duplicate-case workflow scripts had a parenthesis error. The scripts were corrected, compiled before Newman execution, and the complete suite was rerun from a clean fixture. Only the second run is reported below. The original database was restored afterward.

## Result summary

| Metric | Result |
| --- | ---: |
| FR-14 POST test cases executed | 47 |
| Total HTTP requests | 93 |
| Assertions | 57 |
| Assertions passed | 32 |
| Assertions failed | 25 |
| Cases with no failed assertion | 22 |
| Cases with at least one failed assertion | 25 |
| Test-script syntax/runtime failures | 0 |

Failing case IDs: `FR14POST-AI-007`–`020`, `022`, `027`, `029`–`031`, `040`, `FR14POST-H-001`–`004`, and `007`.

The attributable HTML report is stored in `reports/newman/fr14-post.html`. Raw JSON diagnostics are retained outside the submission tree under `.runtime/fr14post`.

## Confirmed defect candidates

### BUG-FR14POST-001 — Category creation does not validate or normalize `name`

- Leading/trailing whitespace was persisted rather than trimmed.
- Whitespace-only, missing, empty, null, numeric, boolean, object, and array values returned 200 and inserted rows.
- Extra fields, including a prototype-shaped field, were silently ignored instead of returning the approved 400.
- In a mixed concurrent pair, both valid and whitespace-only requests succeeded.
- Affected cases: `FR14POST-AI-007`–`017`, `031`, `FR14POST-H-003`, `004`, and `007`.
- Severity proposal: High.

### BUG-FR14POST-002 — Parser/media errors expose internals or return 500

- Malformed JSON returned 400 but exposed `node_modules` and parser details in an HTML error page.
- JSON text sent as `text/plain` and form data caused an unhandled destructuring error and HTTP 500 instead of 415.
- Affected cases: `FR14POST-AI-018`–`020`.
- Severity proposal: High.

### BUG-FR14POST-003 — Category creation does not enforce admin authorization

- A valid normal-user token created categories successfully.
- Query/header role spoofing did not matter because every authenticated user was accepted.
- A token forged with the hard-coded secret and claiming admin for normal-user ID 2 was accepted.
- The server trusted the JWT role without checking the current database account.
- Affected cases: `FR14POST-AI-027`, `029`, `030`, `FR14POST-H-001`, and `002`.
- Severity proposal: Critical.

### BUG-FR14POST-004 — Empty Authorization is classified inconsistently

- An empty `Authorization` value returned 403 instead of the approved 401 for missing/empty credentials.
- Affected case: `FR14POST-AI-022`.
- Severity proposal: Low.

### BUG-FR14POST-005 — POST ignores unacceptable response media type

- An admin request with `Accept: text/html` returned 200 and inserted the category instead of returning the approved 406 without mutation.
- Affected case: `FR14POST-AI-040`.
- Severity proposal: Low.

## Passing behavior and observations

- Ordinary, Unicode, XSS-like, and SQL-like non-empty strings were stored as literal values with parameterized SQL.
- Exact, case-varied, Unicode-equivalent, replayed, and concurrent duplicate names were all allowed with distinct IDs, matching the approved duplicate policy.
- 255- and 256-character names were accepted; these remain observations because no maximum length is specified.
- Missing, malformed, expired, and tampered bearer credentials followed their approved status codes except the empty-header case above.
- A syntactically valid JSON primitive was rejected with 400 by the JSON parser.

GitHub Issues remain pending until real screenshots can be attached.
