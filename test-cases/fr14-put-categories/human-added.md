# FR-14 PUT Category — Human-Added Test Cases

The student authorized autonomous selection of additional cases. These seven cases reuse the approved admin, validation, identifier, and response oracles.

| ID | Student-added scenario | Preconditions and steps | Expected result / oracle | Why the AI missed it |
| --- | --- | --- | --- | --- |
| FR14PUT-H-001 | Forged admin token from exposed secret | Sign `role=admin` for normal-user ID 2 with the SUT secret and attempt an update. | 403; target remains unchanged. | The AI tested ordinary user tokens but did not join source review to an end-to-end forged-role attack. |
| FR14PUT-H-002 | JWT role conflicts with current database role | Use a signed token claiming admin for an account stored as normal user. | 403; server-side account authorization wins and target remains unchanged. | The generated set did not verify token claims against current account state. |
| FR14PUT-H-003 | Duplicate JSON `name` keys ending in blank value | Send `{"name":"Safe","name":"   "}`. | 400; original value remains unchanged after parsing and trim validation. | Duplicate JSON members were absent from the value partitions. |
| FR14PUT-H-004 | Prototype-shaped extra field | Send a valid name plus raw `__proto__` object. | 400; original value remains unchanged and no prototype side effect occurs. | Ordinary extra fields do not cover dangerous parser/property names. |
| FR14PUT-H-005 | Idempotent replay | Submit the same valid update twice to one ID. | Both return the exact success contract; one row remains with the same ID and final name. | The AI covered concurrency but not safe retry behavior. |
| FR14PUT-H-006 | Update/delete race | Concurrently update and delete a fixture row, then read the final state. | Update may win before delete (200) or lose after delete (404), delete succeeds, final row is absent, and PUT never recreates it. | The AI tested concurrent updates but not a lifecycle race across two methods. |
| FR14PUT-H-007 | Product reference stability | Update the name of a category referenced by a fixture product. | Product `category_id` remains the same, category ID remains the same, and no product field changes. | The original set checked category rows but not downstream references. |

## Human extension summary

- Student-added cases: **7**
- Authorization/security cases: **2**
- Parser/validation cases: **2**
- Retry, lifecycle-race, and referential-integrity cases: **3**
- Execution status: **all 7 executed; see `execution-results.md`**
