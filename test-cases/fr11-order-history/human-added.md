# FR-11 User Order History — Human-Added Test Cases

The student selected all seven candidate cases on 2026-09-03.

| ID | Student-selected scenario | Preconditions and steps | Expected result / oracle | Why the AI missed it |
| --- | --- | --- | --- | --- |
| FR11-H-001 | Forge JWT with exposed signing secret | Create User B with a private sentinel order. Sign a new token claiming User B's ID using the secret found in the SUT source, then call personal history. | Secure design must not expose a usable signing key. If the forged token returns User B's order, record a critical authentication/IDOR defect. | The first pass treated JWT validation as a black box and did not connect source-code secret exposure to an end-to-end forged-token attack. |
| FR11-H-002 | Signed token missing `id` | Sign a token containing `role` but no subject/user ID and call history. | 403; never return `[]` as if this were an authenticated empty account. | The AI covered malformed and expired tokens but assumed all correctly signed tokens contained required claims. |
| FR11-H-003 | Signed token with wrong-type/SQL-like `id` | Sign tokens with string, null, negative, and SQL-like `id` claims. | 403 for invalid claim shape; no SQL error, data leakage, or order returned. | The initial set validated signature integrity but not semantic validation of claims. |
| FR11-H-004 | Sensitive response caching | Call history with a valid user token and inspect response headers. | Security-hardening oracle: `Cache-Control` contains `no-store`; absence is documented as a hardening gap unless the course oracle treats it as mandatory. | The AI focused on body/schema and omitted transport-level privacy headers. |
| FR11-H-005 | Authorization token smuggling | Send an Authorization value containing two bearer credentials separated by comma/whitespace. | 401/403; server must not silently choose an attacker-controlled token or expose any order. | The AI tested one malformed credential at a time, not ambiguous multi-credential parsing. |
| FR11-H-006 | Account deletion/read race | Start multiple history reads while deleting the same test account; issue a final read with the old token after deletion completes. | Final read returns the student-approved 404 and no data. In-flight responses are recorded with timing; post-deletion leakage is a defect. | The AI tested deleted principals and concurrent reads separately but not the state transition between them. |
| FR11-H-007 | Large-history cross-user sentinel | Seed User A with 1,000 orders and User B with one unique sentinel order; request User A's history. | 200 with exactly 1,000 User A orders, newest first, strict schema, and no User B sentinel. Response time is recorded but not treated as an SLA. | The AI covered cardinality and concurrency in small sets, not large-volume isolation with a recognizable foreign sentinel. |

## Human extension summary

- Student-selected cases: **7**
- Security/authentication and ownership cases: **5**
- Security hardening/robustness cases: **2**
- Execution status: **not yet executed**
