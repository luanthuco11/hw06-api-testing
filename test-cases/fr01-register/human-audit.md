# FR-01 Registration — Human Audit of AI-Generated Cases

Audit basis: EShop FR-01, API specification, SEC-01/04/05, and the student's decisions on 2026-09-02.

## Student-approved oracle decisions

- Keep one-character, 255-character, and 256-character name cases as `INCOMPLETE` specification-gap tests.
- Treat email uniqueness as case-sensitive: `Case@Test.com` and `case@test.com` are distinct.
- Use HTTP 400 for invalid input, 409 for duplicate email, and 415 for unsupported media type.

## Audit results

| ID | Verdict | Audit reasoning | Correction or final oracle |
| --- | --- | --- | --- |
| FR01-AI-001 | VALID | Direct happy path and explicit success schema. | Keep as generated. |
| FR01-AI-002 | VALID | Vietnamese names are legitimate non-empty strings. | Keep as generated. |
| FR01-AI-003 | INCOMPLETE | “Full name” has no stated minimum length. | Execute as a specification-gap observation; do not report acceptance/rejection as a product bug. |
| FR01-AI-004 | INCOMPLETE | The specification defines no 255-character maximum. | Execute as a specification-gap observation; do not report acceptance/rejection as a product bug. |
| FR01-AI-005 | INCOMPLETE | The specification defines no 256-character boundary. | Execute as a specification-gap observation; do not report acceptance/rejection as a product bug. |
| FR01-AI-006 | VALID | Name is a required registration field. | Expect HTTP 400 and no inserted user. |
| FR01-AI-007 | VALID | Null does not provide a full name. | Expect HTTP 400 and no inserted user. |
| FR01-AI-008 | VALID | Empty string does not provide a full name. | Expect HTTP 400 and no inserted user. |
| FR01-AI-009 | VALID | Whitespace-only input is empty after normalization. | Expect HTTP 400 and no inserted user. |
| FR01-AI-010 | VALID | JSON number is not a textual full name. | Expect HTTP 400 and no inserted user. |
| FR01-AI-011 | VALID | Uppercase characters are permitted in a syntactically valid email. | Keep as generated. |
| FR01-AI-012 | VALID | Plus addressing is syntactically valid. | Keep as generated. |
| FR01-AI-013 | VALID | Short local/domain labels remain syntactically valid. | Keep as generated. |
| FR01-AI-014 | VALID | Email is required. | Expect HTTP 400 and no inserted user. |
| FR01-AI-015 | VALID | Null is not a valid email. | Expect HTTP 400 and no inserted user. |
| FR01-AI-016 | VALID | Empty string is not a valid email. | Expect HTTP 400 and no inserted user. |
| FR01-AI-017 | VALID | Whitespace-only string is not a valid email. | Expect HTTP 400 and no inserted user. |
| FR01-AI-018 | VALID | Missing `@` violates the email format. | Expect HTTP 400 and no inserted user. |
| FR01-AI-019 | VALID | Missing local part violates the email format. | Expect HTTP 400 and no inserted user. |
| FR01-AI-020 | VALID | Missing domain violates the email format. | Expect HTTP 400 and no inserted user. |
| FR01-AI-021 | VALID | Embedded whitespace violates the email format. | Expect HTTP 400 and no inserted user. |
| FR01-AI-022 | VALID | Exact email uniqueness is explicit. | First request 200; duplicate request 409; only one account exists. |
| FR01-AI-023 | INVALID | AI assumed case-insensitive uniqueness, contrary to the student's selected interpretation. | Both registrations return 200 and create distinct accounts. |
| FR01-AI-024 | INVALID | SQL payload placed in `email` also violates email syntax, so rejection cannot demonstrate parameterized queries. | Move payload to `name`, use valid unique email/password; expect 200, literal data storage, and no database damage or SQL details. |
| FR01-AI-025 | INVALID | XSS payload placed in `email` also violates email syntax, conflating email validation with output encoding. | Move payload to `name`, use valid unique email/password; registration may return 200, but later rendering must encode it and never execute it. |
| FR01-AI-026 | VALID | Exact lower password boundary with all required classes. | Keep as generated. |
| FR01-AI-027 | VALID | Direct off-point below the eight-character minimum. | Expect HTTP 400 and no inserted user. |
| FR01-AI-028 | VALID | Missing uppercase class. | Expect HTTP 400 and no inserted user. |
| FR01-AI-029 | VALID | Missing lowercase class. | Expect HTTP 400 and no inserted user. |
| FR01-AI-030 | VALID | Missing digit class. | Expect HTTP 400 and no inserted user. |
| FR01-AI-031 | VALID | Missing special-character class. | Expect HTTP 400 and no inserted user. |
| FR01-AI-032 | VALID | `@` is in the stated allowed special set. | Keep as generated. |
| FR01-AI-033 | VALID | `#` is outside the stated allowed set when it is the only special. | Expect HTTP 400 and no inserted user. |
| FR01-AI-034 | VALID | Password is required. | Expect HTTP 400 and no inserted user. |
| FR01-AI-035 | VALID | Null is not a valid password. | Expect HTTP 400 and no inserted user. |
| FR01-AI-036 | VALID | Empty string violates required and complexity constraints. | Expect HTTP 400 and no inserted user. |
| FR01-AI-037 | VALID | Directly checks SEC-01 rather than inferring storage from an API response. | Expect 200, then verify stored value differs from plaintext and is a salted password hash. |
| FR01-AI-038 | VALID | Malformed JSON is a request-contract partition. | Expect HTTP 400, no account, and no stack trace/internal path. |
| FR01-AI-039 | VALID | Media-type handling is needed for robust API validation. | Use the student-approved HTTP 415 oracle and assert no account creation. |
| FR01-AI-040 | INCOMPLETE | The specification forbids privilege escalation but does not define whether unknown fields must be rejected or ignored. | Primary invariant: no admin account is created. Record 400 rejection or 200-with-ignored-fields; treat neither alone as a bug. |

## Summary

| Verdict | Count |
| --- | ---: |
| VALID | 33 |
| INVALID | 3 |
| INCOMPLETE | 4 |
| Total | 40 |

The three invalid cases are replaced by corrected versions in this audit. Incomplete cases remain explicitly identified and cannot independently establish a product defect.
