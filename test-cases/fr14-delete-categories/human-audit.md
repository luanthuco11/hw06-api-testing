# FR-14 DELETE Category — Human Audit

## Student-approved decisions

- Success is exactly HTTP 200 with `{"message":"Category deleted"}`.
- A category referenced by a product returns HTTP 409 and is not deleted.
- An encoded plus-sign ID such as `%2B15` returns HTTP 400.
- An empty JSON object body is allowed and ignored.
- A JSON body containing any field returns HTTP 400 and deletes nothing.
- A `text/plain` body returns HTTP 415 and deletes nothing.
- Existing ID conventions remain: nonexistent positive ID is 404; invalid ID is 400.

## Audit results

| IDs | Verdict | Reason/correction |
| --- | --- | --- |
| FR14DELETE-AI-001–014 | VALID | Targeting, duplicate-name isolation, and approved 400/404 identifier partitions are deterministic. |
| FR14DELETE-AI-015 | VALID | Corrected oracle: encoded plus-sign ID returns 400 with no mutation. |
| FR14DELETE-AI-016–026 | VALID | Route syntax, authentication, admin authorization, and privilege-bypass cases have explicit outcomes. |
| FR14DELETE-AI-027 | VALID | Corrected oracle: exact `200 {"message":"Category deleted"}` response. |
| FR14DELETE-AI-028–030 | VALID | Repeat and concurrency behavior follows one-row deletion atomicity. |
| FR14DELETE-AI-031 | VALID | Corrected oracle: referenced category returns 409 and remains present. |
| FR14DELETE-AI-032–034 | VALID | Isolation/query handling and body-free DELETE behavior are bounded. |
| FR14DELETE-AI-035 | VALID | Corrected oracle: empty JSON object is ignored and target is deleted normally. |
| FR14DELETE-AI-036 | VALID | Corrected oracle: any body field returns 400 without deletion. |
| FR14DELETE-AI-037 | VALID | Corrected oracle: irrelevant `text/plain` body returns 415 without deletion. |
| FR14DELETE-AI-038–040 | VALID | Content negotiation, CORS, and non-resurrection have explicit or invariant oracles. |

## Summary

| Verdict | Count |
| --- | ---: |
| VALID | 40 |
| INVALID | 0 |
| INCOMPLETE | 0 |
| Total | 40 |
