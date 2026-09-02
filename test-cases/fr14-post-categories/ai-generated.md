# FR-14 POST Categories — AI-Generated Test Cases

Status: unreviewed AI output.

## Contract supplied to the AI

- Feature: FR-14 Category Management
- Endpoint: `POST /api/categories`
- Request body contains a required, non-empty category `name`
- FR-12 requires admin authorization for data-changing category operations
- Required assignment header: `X-Student-Id: 23127414`

## Generated cases

| ID | Area | Scenario | Expected result derived from specification |
| --- | --- | --- | --- |
| FR14POST-AI-001 | Baseline | Admin creates category with ordinary non-empty name | Success; response identifies the new category and GET returns it once. |
| FR14POST-AI-002 | Unicode | Admin creates `Điện thoại thông minh` | Success and exact UTF-8 value is persisted. |
| FR14POST-AI-003 | Unicode | Admin creates a composed Vietnamese name | Success without corruption or normalization loss. |
| FR14POST-AI-004 | Boundary | Name contains one visible character | Success because it is non-empty. |
| FR14POST-AI-005 | Boundary | Name contains 255 characters | Length limit is unspecified; observe without claiming a defect. |
| FR14POST-AI-006 | Boundary | Name contains 256 characters | Length limit is unspecified; observe without claiming a defect. |
| FR14POST-AI-007 | Whitespace | Name has leading and trailing spaces | Trim/preserve behavior is unspecified; observe the stored value. |
| FR14POST-AI-008 | Whitespace | Name is one ASCII space | Whether blank-only counts as empty needs a student oracle. |
| FR14POST-AI-009 | Whitespace | Name contains only tab/newline whitespace | Whether blank-only counts as empty needs a student oracle. |
| FR14POST-AI-010 | Required field | `name` is missing | 400; no category is inserted. |
| FR14POST-AI-011 | Required field | `name` is empty string | 400; no category is inserted. |
| FR14POST-AI-012 | Required field | `name` is null | 400; no category is inserted. |
| FR14POST-AI-013 | Type validation | `name` is a number | 400; no category is inserted. |
| FR14POST-AI-014 | Type validation | `name` is boolean | 400; no category is inserted. |
| FR14POST-AI-015 | Type validation | `name` is an object | 400; no category is inserted. |
| FR14POST-AI-016 | Type validation | `name` is an array | 400; no category is inserted. |
| FR14POST-AI-017 | Body parsing | Request has no body | 400 safe JSON error; no insert. |
| FR14POST-AI-018 | Body parsing | Malformed JSON body | 400 safe error without stack path or SQL internals. |
| FR14POST-AI-019 | Media type | JSON text sent as `text/plain` | 415; no insert. |
| FR14POST-AI-020 | Media type | Form-encoded `name` | 415 unless the API explicitly documents form support; no insert. |
| FR14POST-AI-021 | Authorization | Authorization header omitted | 401; no insert. |
| FR14POST-AI-022 | Authorization | Authorization header is empty | 401; no insert. |
| FR14POST-AI-023 | Authorization | `Bearer` has no credential | 401; no insert. |
| FR14POST-AI-024 | Authorization | Malformed token | 403; no insert. |
| FR14POST-AI-025 | Authorization | Expired correctly signed token | 403; no insert. |
| FR14POST-AI-026 | Authorization | Tampered token | 403; no insert. |
| FR14POST-AI-027 | Authorization | Valid normal-user token | 403 because category writes are admin-only; no insert. |
| FR14POST-AI-028 | Authorization | Valid admin token | Success and exactly one row is inserted. |
| FR14POST-AI-029 | Privilege bypass | Normal-user token plus `?role=admin` | 403; query data cannot elevate privilege. |
| FR14POST-AI-030 | Privilege bypass | Normal-user token plus `X-Role: admin` | 403; client header cannot elevate privilege. |
| FR14POST-AI-031 | Extra fields | Admin sends `{name, id, role, created_at}` | Reject-vs-ignore behavior for extra fields needs a student oracle; fields must never be mass-assigned. |
| FR14POST-AI-032 | Duplicate | Create the same exact name twice | Uniqueness is unspecified; observe both responses and final count. |
| FR14POST-AI-033 | Duplicate | Create names differing only by letter case | Case-sensitive uniqueness is unspecified; observe final state. |
| FR14POST-AI-034 | Duplicate | Create canonically equivalent Unicode names | Unicode-normalized uniqueness is unspecified; observe final state. |
| FR14POST-AI-035 | Stored XSS | Create `<script>alert(1)</script>` | If accepted as a non-empty string, it remains inert JSON data; no HTML or execution. |
| FR14POST-AI-036 | SQL injection | Create `x'); DROP TABLE categories;--` | No SQL execution or error disclosure; only a literal category may be inserted. |
| FR14POST-AI-037 | Response contract | Inspect successful response | 200 JSON with exactly `message` and positive integer `id`; message is `Category created`. |
| FR14POST-AI-038 | Atomicity | Send ten concurrent requests with ten unique names | Ten successes produce ten distinct IDs and exactly ten new rows. |
| FR14POST-AI-039 | Concurrent duplicate | Send ten simultaneous requests with one identical name | Uniqueness/atomic duplicate policy is unspecified; observe successes and final count. |
| FR14POST-AI-040 | Content negotiation | Admin sends `Accept: text/html` | 406, matching the student-approved category API content-negotiation rule; no insert. |

## Coverage count

- AI-generated cases: **40**
- Human-added cases: **0**
- Executed cases: **0**
