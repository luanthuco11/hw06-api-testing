# FR-14 POST Categories — Human-Added Test Cases

The student authorized autonomous selection of additional test cases. These seven cases extend the audited AI set using only approved validation, duplicate, and admin-authorization oracles.

| ID | Student-added scenario | Preconditions and steps | Expected result / oracle | Why the AI missed it |
| --- | --- | --- | --- | --- |
| FR14POST-H-001 | Forge an admin JWT with the exposed signing secret | Sign a token claiming `role=admin` for the normal-user ID using the secret found in SUT source; attempt a create. | 403 and no insert. Acceptance proves the exposed secret enables privilege escalation. | The initial set tested malformed/tampered credentials but did not combine source review with an end-to-end forged admin token. |
| FR14POST-H-002 | JWT role disagrees with the database account | Use a correctly signed token with normal-user ID 2 but an `admin` role claim. | 403 and no insert because server-side account authorization must override a client-carried stale/forged role. | The AI tested an ordinary user token, not claim-to-database role consistency. |
| FR14POST-H-003 | Duplicate `name` keys with an invalid final value | Send raw JSON `{"name":"Safe","name":"   "}` as admin. | 400 and no insert after the effective parsed name is trimmed and found empty. | The AI partitioned value types but not ambiguous duplicate JSON member names. |
| FR14POST-H-004 | Prototype-shaped extra field | Send `{name:"Safe", "__proto__": {role:"admin"}}` as raw JSON. | 400 and no insert because every field other than `name` is forbidden; no prototype side effect. | The extra-field case used ordinary keys and did not exercise dangerous object-property names. |
| FR14POST-H-005 | Valid JSON with wrong root type | Send the JSON string `"Laptop"` instead of an object. | 400 safe response and no insert. | The AI covered missing and malformed bodies but not syntactically valid JSON of the wrong root shape. |
| FR14POST-H-006 | Replay is allowed by duplicate policy | Submit the identical valid admin request twice and then read categories. | Both requests succeed with distinct positive IDs; the exact name appears twice. | The initial duplicate test did not verify retry/replay semantics and response-ID uniqueness together. |
| FR14POST-H-007 | Concurrent valid/invalid isolation | Concurrently submit one unique valid name and one whitespace-only name. | Valid request succeeds once; invalid request returns 400; final state contains exactly the valid row and no blank row. | The AI tested all-valid concurrency but not atomic isolation when validation outcomes differ. |

## Human extension summary

- Student-added cases: **7**
- Authorization/security cases: **2**
- Parser and validation cases: **3**
- Duplicate/concurrency cases: **2**
- Execution status: **not yet executed**
