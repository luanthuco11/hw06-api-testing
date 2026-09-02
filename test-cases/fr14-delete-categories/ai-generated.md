# FR-14 DELETE Category — AI-Generated Test Cases

Status: human-audited and executed; see `human-audit.md` and `execution-results.md`.

## Contract supplied to the AI

- Feature: FR-14 Category Management
- Endpoint: `DELETE /api/categories/:id`
- Category writes require a valid admin authorization
- Previously approved identifier convention: nonexistent positive ID is 404; malformed/out-of-range ID is 400
- Previously approved category content negotiation: `Accept: text/html` is 406
- Required assignment header: `X-Student-Id: 23127414`

## Generated cases

| ID | Area | Scenario | Expected result derived from specification |
| --- | --- | --- | --- |
| FR14DELETE-AI-001 | Baseline | Admin deletes an existing category | Success; target ID disappears and all other rows remain. |
| FR14DELETE-AI-002 | Cardinality | Delete the only category | Success and subsequent GET returns `[]`. |
| FR14DELETE-AI-003 | Targeting | Delete first ID from a three-row set | Only first row disappears. |
| FR14DELETE-AI-004 | Targeting | Delete middle ID from a three-row set | Only middle row disappears. |
| FR14DELETE-AI-005 | Targeting | Delete last ID from a three-row set | Only last row disappears. |
| FR14DELETE-AI-006 | Duplicate names | Two rows share a name; delete one ID | Only the selected ID disappears; the duplicate remains. |
| FR14DELETE-AI-007 | Identifier | Positive ID does not exist | 404; category set remains unchanged. |
| FR14DELETE-AI-008 | Identifier | ID is zero | 400; no mutation. |
| FR14DELETE-AI-009 | Identifier | ID is negative | 400; no mutation. |
| FR14DELETE-AI-010 | Identifier | ID is decimal `1.5` | 400; no mutation. |
| FR14DELETE-AI-011 | Identifier | ID is alphabetic | 400; no mutation. |
| FR14DELETE-AI-012 | Identifier | ID is URL-encoded SQL-like text | 400 safe response; no SQL execution or disclosure. |
| FR14DELETE-AI-013 | Identifier | Very large positive integer | 404; no mutation. |
| FR14DELETE-AI-014 | Path syntax | ID has leading zeros such as `0014` | Treat as valid numeric ID 14 and delete exactly that row. |
| FR14DELETE-AI-015 | Path syntax | Encoded plus sign `%2B15` | Canonicalization behavior needs human review; never delete a different ID. |
| FR14DELETE-AI-016 | Path syntax | Missing `:id` (`DELETE /api/categories`) | 404 route not found; no mutation. |
| FR14DELETE-AI-017 | Path syntax | Extra path segment after valid ID | 404 route not found; no mutation. |
| FR14DELETE-AI-018 | Authorization | Authorization omitted | 401; target remains. |
| FR14DELETE-AI-019 | Authorization | Authorization is empty | 401; target remains. |
| FR14DELETE-AI-020 | Authorization | `Bearer` has no credential | 401; target remains. |
| FR14DELETE-AI-021 | Authorization | Malformed token | 403; target remains. |
| FR14DELETE-AI-022 | Authorization | Expired admin token | 403; target remains. |
| FR14DELETE-AI-023 | Authorization | Tampered token | 403; target remains. |
| FR14DELETE-AI-024 | Authorization | Valid normal-user token | 403; target remains. |
| FR14DELETE-AI-025 | Privilege bypass | Normal user adds `?role=admin` | 403; target remains. |
| FR14DELETE-AI-026 | Privilege bypass | Normal user adds `X-Role: admin` | 403; target remains. |
| FR14DELETE-AI-027 | Response contract | Inspect successful delete response | Exact success status/body needs student confirmation. |
| FR14DELETE-AI-028 | Repeatability | Delete the same ID twice sequentially | First succeeds; second returns 404; no additional mutation. |
| FR14DELETE-AI-029 | Concurrency | Ten simultaneous deletes for one ID | Exactly one success and nine 404 responses; target is absent. |
| FR14DELETE-AI-030 | Concurrency | Delete ten distinct IDs concurrently | Ten successes and all ten targets are absent. |
| FR14DELETE-AI-031 | Referential integrity | Delete category referenced by a product | Reject/cascade/orphan policy is unspecified and needs student confirmation. |
| FR14DELETE-AI-032 | Isolation | Delete unrelated category while products reference another | Success; products and referenced category remain unchanged. |
| FR14DELETE-AI-033 | Query isolation | Add unknown `?force=true` | Unknown query cannot broaden deletion semantics; delete only target or reject safely. |
| FR14DELETE-AI-034 | Request body | Send no body | Normal DELETE behavior; body is not required. |
| FR14DELETE-AI-035 | Request body | Send `{}` with JSON media type | Ignore-vs-reject policy for a DELETE body needs student confirmation; only target may change. |
| FR14DELETE-AI-036 | Request body | Send `{id: anotherId}` | Path ID must remain authoritative; body must never choose another target. |
| FR14DELETE-AI-037 | Media type | Send an irrelevant `text/plain` body | Media policy needs human review; only path target may change. |
| FR14DELETE-AI-038 | Content negotiation | Admin sends `Accept: text/html` | 406 and target remains. |
| FR14DELETE-AI-039 | CORS preflight | OPTIONS requests DELETE from a foreign origin | Controlled preflight permits DELETE without exposing credentials unexpectedly. |
| FR14DELETE-AI-040 | Non-resurrection | Delete target, perform many GETs, then read again | Deleted ID never reappears and GETs do not mutate state. |

## Coverage count

- AI-generated cases: **40**
- Human-added cases: **7**
- Executed cases: **47**
