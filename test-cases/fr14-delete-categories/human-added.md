# FR-14 DELETE Category — Human-Added Test Cases

The student authorized autonomous selection of additional cases. These seven cases use only the approved identifier, body, and authorization rules.

| ID | Student-added scenario | Preconditions and steps | Expected result / oracle | Why the AI missed it |
| --- | --- | --- | --- | --- |
| FR14DELETE-H-001 | Forged admin token from exposed secret | Sign an admin token for normal-user ID 2 using the SUT secret; attempt deletion. | 403 and target remains. | Initial cases did not connect source-secret exposure to an end-to-end destructive privilege escalation. |
| FR14DELETE-H-002 | JWT admin role conflicts with database role | Use a signed token claiming admin for an account currently stored as normal user. | 403 and target remains. | The generated set did not verify claims against current server-side account state. |
| FR14DELETE-H-003 | Signed token missing role claim | Use a correctly signed token containing an ID but no role. | 403 and target remains because admin authorization is not established. | Malformed/expired tokens do not cover required-claim semantics. |
| FR14DELETE-H-004 | Two bearer credentials in one header | Send normal-user and admin tokens in one ambiguous Authorization value. | 401 or 403; target remains. | Single-token partitions do not test credential smuggling/parser ambiguity. |
| FR14DELETE-H-005 | Duplicate conflicting `id` body members | Path selects one row while raw body is `{"id":10,"id":11}`. | 400 and neither body ID nor path ID is deleted. | Ordinary unexpected-body testing omitted duplicate JSON members. |
| FR14DELETE-H-006 | Prototype-shaped body field | Send `{ "__proto__": {"force":true} }`. | 400; target remains and no prototype-driven force delete occurs. | The original body case used an ordinary ID field only. |
| FR14DELETE-H-007 | Excessively long noncanonical ID | Send a path ID containing 4,096 decimal digits. | 400 safe response without SQL/internal leakage or mutation. | The generated large-ID case remained within an ordinary numeric representation. |

## Human extension summary

- Student-added cases: **7**
- Authorization/security cases: **4**
- Parser/body/identifier robustness cases: **3**
- Execution status: **not yet executed**
