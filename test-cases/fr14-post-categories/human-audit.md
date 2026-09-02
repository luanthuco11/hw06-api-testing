# FR-14 POST Categories — Human Audit

## Student-approved decisions

- A name containing only whitespace is invalid and returns HTTP 400.
- Leading and trailing whitespace is trimmed before persistence.
- Duplicate category names are allowed, including exact, case-varied, and Unicode-equivalent values.
- A request body containing any field other than `name` returns HTTP 400 and inserts nothing.
- No maximum name length was invented; 255/256-character cases remain observations.

## Audit results

| IDs | Verdict | Reason/correction |
| --- | --- | --- |
| FR14POST-AI-001–004 | VALID | Ordinary, Unicode, and one-character non-empty names have deterministic success oracles. |
| FR14POST-AI-005–006 | INCOMPLETE | The specification defines no maximum length. Observe persistence without treating acceptance or rejection as a defect. |
| FR14POST-AI-007 | VALID | Corrected oracle: trim leading/trailing whitespace and persist `Laptop`, not the padded input. |
| FR14POST-AI-008–009 | VALID | Corrected oracle: whitespace-only names return 400 and insert nothing. |
| FR14POST-AI-010–030 | VALID | Required-field/type/media/authentication and privilege-boundary cases follow the supplied requirements and approved status-code convention. |
| FR14POST-AI-031 | VALID | Corrected oracle: any extra request field returns 400; no mass assignment or insert. |
| FR14POST-AI-032–034 | VALID | Corrected oracle: all duplicate variants are allowed and create distinct positive IDs. |
| FR14POST-AI-035–040 | VALID | Injection safety, response contract, concurrency, and the approved 406 content-negotiation rule are testable. |

## Summary

| Verdict | Count |
| --- | ---: |
| VALID | 38 |
| INVALID | 0 |
| INCOMPLETE | 2 |
| Total | 40 |
