# FR-11 User Order History — Human Audit

Audit basis: FR-11, the API specification, SEC-02, and the student's oracle decisions on 2026-09-02.

## Student-approved oracle decisions

- Use a strict order schema containing exactly `id`, `created_at`, `total_amount`, and `status`.
- Missing/empty credentials return 401; invalid, expired, or tampered JWTs return 403.
- A valid JWT whose account has been deleted returns 404.
- `POST /api/orders/my-orders` returns 404 because no such route exists.

## Audit results

| ID | Verdict | Reason and correction/final oracle |
| --- | --- | --- |
| FR11-AI-001 | VALID | Direct empty-history partition; expect 200 and an empty array. |
| FR11-AI-002 | VALID | Direct single-order partition. |
| FR11-AI-003 | VALID | Multiple-order partition plus ownership check. |
| FR11-AI-004 | VALID | The implementation-facing API must preserve newest-first order expected by the feature. |
| FR11-AI-005 | VALID | Student approved strict four-field schema. |
| FR11-AI-006 | VALID | Type checks operationalize the strict schema. |
| FR11-AI-007 | VALID | Covers `pending`. |
| FR11-AI-008 | VALID | Covers `confirmed`. |
| FR11-AI-009 | VALID | Covers `shipping`. |
| FR11-AI-010 | VALID | Covers `delivered`. |
| FR11-AI-011 | VALID | Covers `canceled`. |
| FR11-AI-012 | INCOMPLETE | Zero total is not a valid normal business order, and FR-11 does not define behavior for corrupted/preloaded data. Observe retrieval but do not claim a product defect from this case alone. |
| FR11-AI-013 | VALID | Smallest positive numeric total is a useful retrieval boundary. |
| FR11-AI-014 | VALID | Checks numeric preservation within JavaScript's safe-integer range. |
| FR11-AI-015 | INVALID | Original expectation returned a Vietnamese shipping address, contradicting the strict four-field schema. Corrected: preload a Vietnamese address, then assert that `shipping_address` is not returned. |
| FR11-AI-016 | VALID | Missing Authorization maps to the approved 401 oracle. |
| FR11-AI-017 | VALID | Empty Authorization maps to 401. |
| FR11-AI-018 | VALID | Bearer keyword without a credential maps to 401. |
| FR11-AI-019 | VALID | Blank bearer credential maps to 401. |
| FR11-AI-020 | VALID | Structurally plausible but invalid JWT maps to 403. |
| FR11-AI-021 | VALID | Malformed JWT maps to 403. |
| FR11-AI-022 | VALID | Expired signed JWT maps to 403. |
| FR11-AI-023 | VALID | Payload tampering must invalidate the signature and return 403. |
| FR11-AI-024 | VALID | Unsigned `none` token must return 403. |
| FR11-AI-025 | VALID | Basic scheme does not meet the Bearer-token contract; expect 401. |
| FR11-AI-026 | VALID | Authentication scheme matching is case-insensitive. |
| FR11-AI-027 | VALID | Ambiguous whitespace is rejected as malformed credentials; use 401. |
| FR11-AI-028 | VALID | Student selected 404 for a deleted principal. |
| FR11-AI-029 | VALID | Admin remains isolated to the admin account's own history on a personal endpoint. |
| FR11-AI-030 | VALID | Direct ownership and IDOR protection test. |
| FR11-AI-031 | VALID | Client-supplied `user_id` must not override the JWT identity. |
| FR11-AI-032 | INVALID | Because this endpoint does not define a query input, the payload cannot prove query parameterization. Corrected: treat it as an unrecognized-query isolation case, requiring no SQL error/leak and only the authenticated user's data. |
| FR11-AI-033 | VALID | Query text must not elevate role or change ownership. |
| FR11-AI-034 | VALID | Explicit sensitive-data minimization check. |
| FR11-AI-035 | VALID | Strong cross-user cardinality isolation check. |
| FR11-AI-036 | VALID | GET must be repeatable and non-mutating. |
| FR11-AI-037 | VALID | Concurrent reads should remain consistent and authorized. |
| FR11-AI-038 | VALID | Student selected 404 for the nonexistent POST route. |
| FR11-AI-039 | VALID | JSON media type and array parsing are part of response validation. |
| FR11-AI-040 | INCOMPLETE | No response-time SLA is specified. Keep the two-second value as an environment observation, not a conformance oracle. |

## Summary

| Verdict | Count |
| --- | ---: |
| VALID | 36 |
| INVALID | 2 |
| INCOMPLETE | 2 |
| Total | 40 |

The two invalid cases are corrected above. The original AI output remains unchanged for audit traceability.
