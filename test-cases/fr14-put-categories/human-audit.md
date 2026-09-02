# FR-14 PUT Category — Human Audit

## Student-approved decisions

- A positive integer ID that does not exist returns HTTP 404.
- Invalid IDs such as zero, negative, decimal, alphabetic, or SQL-like values return HTTP 400.
- A successful update returns exactly HTTP 200 and `{"message":"Category updated"}`.
- Previously approved create rules also apply: trim surrounding whitespace, reject blank names and extra fields with 400, allow duplicate names, and return 406 for unacceptable HTML.
- No maximum name length was invented.

## Audit results

| IDs | Verdict | Reason/correction |
| --- | --- | --- |
| FR14PUT-AI-001–004 | VALID | Normal and Unicode updates preserve the selected ID with deterministic success behavior. |
| FR14PUT-AI-005–006 | INCOMPLETE | No maximum length is specified; both outcomes remain observations. |
| FR14PUT-AI-007–021 | VALID | Apply the previously approved trim, validation, parser, media, and exact-row rules. |
| FR14PUT-AI-022 | VALID | Corrected oracle: nonexistent positive integer ID returns 404 and creates nothing. |
| FR14PUT-AI-023–027 | VALID | Corrected oracle: every invalid ID returns 400 without mutation or information leakage. |
| FR14PUT-AI-028–037 | VALID | Authentication, admin authorization, extra-field, duplicate, and injection expectations are deterministic. |
| FR14PUT-AI-038 | VALID | Corrected oracle: exact 200 response body contains only `message: Category updated`. |
| FR14PUT-AI-039–040 | VALID | Concurrent atomicity and approved 406 content negotiation have bounded oracles. |

## Summary

| Verdict | Count |
| --- | ---: |
| VALID | 38 |
| INVALID | 0 |
| INCOMPLETE | 2 |
| Total | 40 |
