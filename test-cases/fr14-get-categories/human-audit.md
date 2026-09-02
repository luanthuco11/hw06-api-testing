# FR-14 GET Categories — Human Audit

## Student-approved decisions

- Strict item schema: exactly `id` and `name`.
- Unknown query parameters are ignored and the full list returns with 200.
- `Accept: text/html` returns 406.
- Corrupt fixture data, ETag/cache policy, and performance remain observations when the specification has no oracle.

## Audit results

| IDs | Verdict | Reason/correction |
| --- | --- | --- |
| FR14GET-AI-001–013 | VALID | Cover normal cardinality, exact schema/types, Unicode, boundaries, and duplicate stored rows. |
| FR14GET-AI-014–015 | INCOMPLETE | Empty/null stored names require corrupt direct fixtures; FR-14 defines creation validation but not recovery behavior. Observe without claiming a defect. |
| FR14GET-AI-016–025 | VALID | Cover inert adversarial data, status/media/schema, minimization, and the public-access boundary. |
| FR14GET-AI-026–035 | VALID | Student approved ignore-and-200 behavior for unknown query parameters; repeatability, concurrency, unsupported PATCH, CORS, and JSON Accept have usable oracles. |
| FR14GET-AI-036 | INCOMPLETE | AI offered two outcomes instead of one. Corrected oracle: HTTP 406 for `Accept: text/html`. |
| FR14GET-AI-037–039 | INCOMPLETE | ETag, cache policy, and two-second SLA are not specified; retain only as observations. |
| FR14GET-AI-040 | VALID | GET non-mutation is an explicit HTTP invariant and can be measured by before/after state. |

## Summary

| Verdict | Count |
| --- | ---: |
| VALID | 34 |
| INVALID | 0 |
| INCOMPLETE | 6 |
| Total | 40 |
