# FR-11 User Order History — Execution Results

## Run metadata

| Field | Value |
| --- | --- |
| Date | 2026-09-03 |
| Runner | Newman 6.2.2 with htmlextra and JSON reporters |
| SUT | Teacher repository commit `85af3ba875c88283615e22cb108f13e2fccaf0e9` |
| Host | `http://localhost:3000` |
| Required header | `X-Student-Id: 23127414`, inserted by collection pre-request script |
| Fixture | Users with empty/1/3/5/1,000-order histories, all five statuses, deletion-race account, and foreign sentinel |

The first attempted run was discarded because the SUT resets SQLite during server startup and therefore erased a fixture prepared too early. The valid run below started the server first, then prepared the fixture, verified all seven setup logins, and only then executed the tests.

## Result summary

| Metric | Result |
| --- | ---: |
| FR-11 test cases executed | 47 |
| Setup requests | 7 |
| Total HTTP requests | 71 |
| Assertions | 49 |
| Assertions passed | 35 |
| Assertions failed | 14 |
| Cases with no failed assertion | 33 |
| Cases with at least one failed assertion | 14 |

Failing case IDs: `FR11-AI-002`, `005`, `006`, `015`, `017`, `025`, `027`, `028`, `FR11-H-001`, `002`, `003`, `004`, `006`, and `007`.

The detailed run is stored in `reports/newman/fr11-newman-report.html`. Raw JSON diagnostics are retained outside the submission tree under `.runtime/fr11`.

## Confirmed defect candidates

### BUG-FR11-001 — Order-history response violates the approved strict schema

- Actual order objects include `user_id` and `shipping_address` in addition to the approved fields.
- Expected exact keys: `id`, `created_at`, `total_amount`, `status`.
- Affected cases: `FR11-AI-002`, `005`, `006`, `015`, and `FR11-H-007`.
- Security impact: unnecessary disclosure of internal ownership and address data.
- Severity proposal: Medium.

### BUG-FR11-002 — Authorization scheme and malformed-header handling are inconsistent

- `Basic <valid-jwt>` was accepted and returned private order history.
- Empty Authorization and double-space Bearer forms returned 403 instead of the approved 401.
- Affected cases: `FR11-AI-017`, `025`, `027`.
- Severity proposal: High because a non-Bearer scheme is accepted.

### BUG-FR11-003 — Tokens remain authorized when the account does not exist

- A correctly signed token for nonexistent user ID 9999 returned 200 and `[]` instead of 404.
- After deleting User 8, the old token still returned that user's two orphaned orders with HTTP 200.
- Affected cases: `FR11-AI-028`, `FR11-H-006`.
- Severity proposal: High.

### BUG-FR11-004 — Public hard-coded signing secret enables forged-token IDOR

- A newly signed token claiming User 3's ID was accepted and returned User 3's private order.
- Affected case: `FR11-H-001`.
- Root condition observed in the supplied SUT: JWT secret embedded directly in source.
- Severity proposal: Critical.

### BUG-FR11-005 — Required JWT claims are not semantically validated

- Correctly signed tokens with missing, null, negative, SQL-like, or wrong-type `id` claims all returned 200 rather than 403.
- A string claim `id="2"` was coerced by SQLite and returned User 2's orders.
- Affected cases: `FR11-H-002`, `FR11-H-003`.
- Severity proposal: High.

## Hardening observation

- `FR11-H-004`: the authenticated response has no `Cache-Control: no-store`. This is documented as a privacy-hardening gap rather than a specification defect.
- `FR11-AI-040`: observed local response time was 5 ms; no SLA claim is made.

GitHub Issues remain pending until real screenshots can be attached.
