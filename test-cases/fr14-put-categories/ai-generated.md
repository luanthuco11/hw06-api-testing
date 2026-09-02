# FR-14 PUT Category — AI-Generated Test Cases

Status: unreviewed AI output.

## Contract supplied to the AI

- Feature: FR-14 Category Management
- Endpoint: `PUT /api/categories/:id`
- Request body contains a required, non-empty category `name`
- Category writes require a valid admin authorization
- Previously approved rules: trim surrounding whitespace, reject whitespace-only names and extra fields with 400, allow duplicate names, and return 406 for `Accept: text/html`
- Required assignment header: `X-Student-Id: 23127414`

## Generated cases

| ID | Area | Scenario | Expected result derived from specification |
| --- | --- | --- | --- |
| FR14PUT-AI-001 | Baseline | Admin renames an existing category | Success; the same ID has the new name and no extra row is created. |
| FR14PUT-AI-002 | Unicode | Rename to `Điện thoại thông minh` | Success and exact UTF-8 value is persisted. |
| FR14PUT-AI-003 | Unicode | Rename to a composed Vietnamese name | Success without corruption. |
| FR14PUT-AI-004 | Boundary | Rename to one visible character | Success because the name is non-empty. |
| FR14PUT-AI-005 | Boundary | Rename to 255 characters | Maximum length is unspecified; observe without claiming a defect. |
| FR14PUT-AI-006 | Boundary | Rename to 256 characters | Maximum length is unspecified; observe without claiming a defect. |
| FR14PUT-AI-007 | Whitespace | Rename using leading/trailing spaces | Success; trim before persistence. |
| FR14PUT-AI-008 | Whitespace | Rename using ASCII spaces only | 400; original category remains unchanged. |
| FR14PUT-AI-009 | Whitespace | Rename using tabs/newlines only | 400; original category remains unchanged. |
| FR14PUT-AI-010 | Required field | Body omits `name` | 400; original category remains unchanged. |
| FR14PUT-AI-011 | Required field | `name` is empty string | 400; original category remains unchanged. |
| FR14PUT-AI-012 | Required field | `name` is null | 400; original category remains unchanged. |
| FR14PUT-AI-013 | Type validation | `name` is a number | 400; original category remains unchanged. |
| FR14PUT-AI-014 | Type validation | `name` is boolean | 400; original category remains unchanged. |
| FR14PUT-AI-015 | Type validation | `name` is object | 400; original category remains unchanged. |
| FR14PUT-AI-016 | Type validation | `name` is array | 400; original category remains unchanged. |
| FR14PUT-AI-017 | Body parsing | Request has no body | 400 safe JSON error; no mutation. |
| FR14PUT-AI-018 | Body parsing | Malformed JSON | 400 without stack path or SQL internals; no mutation. |
| FR14PUT-AI-019 | Media type | JSON text sent as `text/plain` | 415; no mutation. |
| FR14PUT-AI-020 | Media type | Form-encoded name | 415; no mutation. |
| FR14PUT-AI-021 | Identifier | Existing smallest positive ID | Update exactly that row. |
| FR14PUT-AI-022 | Identifier | Positive integer ID does not exist | Expected status needs a student oracle; no row is created. |
| FR14PUT-AI-023 | Identifier | ID is zero | Invalid-ID status needs a student oracle; no mutation. |
| FR14PUT-AI-024 | Identifier | ID is negative | Invalid-ID status needs a student oracle; no mutation. |
| FR14PUT-AI-025 | Identifier | ID is decimal `1.5` | Invalid-ID status needs a student oracle; no mutation. |
| FR14PUT-AI-026 | Identifier | ID is alphabetic text | Invalid-ID status needs a student oracle; no mutation. |
| FR14PUT-AI-027 | Identifier | ID is URL-encoded SQL-like text | Safe client error; no SQL execution, disclosure, or mutation. |
| FR14PUT-AI-028 | Authorization | Authorization omitted | 401; original category remains unchanged. |
| FR14PUT-AI-029 | Authorization | Empty Authorization | 401; original category remains unchanged. |
| FR14PUT-AI-030 | Authorization | Malformed bearer token | 403; original category remains unchanged. |
| FR14PUT-AI-031 | Authorization | Expired admin token | 403; original category remains unchanged. |
| FR14PUT-AI-032 | Authorization | Valid normal-user token | 403; original category remains unchanged. |
| FR14PUT-AI-033 | Privilege bypass | Normal user adds `?role=admin` and `X-Role: admin` | 403; client data cannot elevate privilege. |
| FR14PUT-AI-034 | Extra fields | Admin sends `{name, id, role}` | 400; original row remains unchanged and fields are not mass-assigned. |
| FR14PUT-AI-035 | Duplicate | Rename one category to another existing category's exact name | Success because duplicates are allowed; IDs remain distinct. |
| FR14PUT-AI-036 | Stored XSS | Rename to `<script>alert(1)</script>` | Success as inert literal JSON data; no HTML execution. |
| FR14PUT-AI-037 | SQL injection | Rename to `x', name='owned' --` | Only the selected row receives the literal value; no additional mutation or SQL error. |
| FR14PUT-AI-038 | Response contract | Inspect successful response | 200 JSON with exactly `message: Category updated`. |
| FR14PUT-AI-039 | Concurrency | Concurrently rename one row to ten valid unique names | Every response is controlled; exactly one existing row remains and final name equals one submitted value. Ordering is observational. |
| FR14PUT-AI-040 | Content negotiation | Admin sends `Accept: text/html` | 406 and the original category remains unchanged. |

## Coverage count

- AI-generated cases: **40**
- Human-added cases: **0**
- Executed cases: **0**
