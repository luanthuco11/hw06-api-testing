# FR-14 GET Categories — Human-Added Test Cases

The student authorized autonomous selection of additional test cases on 2026-09-03. These six cases extend the audited AI set without inventing performance or cache requirements.

| ID | Student-added scenario | Preconditions and steps | Expected result / oracle | Why the AI missed it |
| --- | --- | --- | --- | --- |
| FR14GET-H-001 | Duplicate unknown query parameters | Seed at least three categories. Send `GET /api/categories?limit=1&limit=0&limit=999`. | 200; response contains the complete category list with strict `id`/`name` schema. Duplicate unknown parameters cannot activate undocumented filtering. | The AI tested single unknown parameters but not HTTP parameter pollution with conflicting repeated values. |
| FR14GET-H-002 | Object/array-shaped query parameters | Send `GET /api/categories?filter[name]=x&fields[]=id&fields[]=secret`. | 200; query keys are ignored, the complete list is returned, and no extra field appears. | The AI covered ordinary and injection-like values but not parser-specific nested/array query shapes. |
| FR14GET-H-003 | Method-override headers on a GET | Record the category list, then issue GET requests with `X-HTTP-Method-Override: DELETE` and `X-Method-Override: DELETE`; read the list again. | Every request is handled as GET and returns 200; the before/after lists are identical. | The AI tested unsupported methods but did not test middleware-driven method override on an otherwise valid GET. |
| FR14GET-H-004 | Stored CRLF/control characters cannot inject response headers | Directly seed a category name containing CRLF, tab, quote, and backslash characters, then request the list. | 200 JSON; characters remain JSON-escaped in the body, no attacker-named response header is created, and strict schema remains intact. | The AI tested XSS/SQL-like names but omitted response-splitting payloads stored in data. |
| FR14GET-H-005 | Concurrent reads during create/delete transition | Start repeated GET requests while an authenticated fixture account creates and deletes a uniquely named category. | Each response is valid JSON and a complete database snapshot with strict schema; after deletion, the final list equals the initial list. | The AI tested simultaneous reads only, not reads spanning a write transition. |
| FR14GET-H-006 | Large-list count and sentinel integrity | Seed 10,000 uniquely numbered categories plus first/middle/last sentinel names, then request the list once. | 200; exactly 10,000 unique IDs are returned, all sentinels are present, every item has strict schema, and no row is truncated. Elapsed time is recorded only as an observation. | The AI proposed a 100-row dataset and an unsupported two-second SLA, but not high-volume completeness with bounded integrity oracles. |

## Human extension summary

- Student-added cases: **6**
- Security and parser-robustness cases: **4**
- Concurrency and high-volume integrity cases: **2**
- Execution status: **not yet executed**
