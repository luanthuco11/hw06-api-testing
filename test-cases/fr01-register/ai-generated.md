# FR-01 Registration — AI-Generated Test Cases

Status: unreviewed AI output. These cases must be audited before execution or inclusion in the final workbook.

## Input supplied to the AI

- Feature: FR-01 Account Registration
- Endpoint: `POST /api/register`
- Required header: `X-Student-Id: 23127414`
- Required fields: full name, email, and password
- Email must be valid and unique
- Password must contain at least eight characters, one uppercase letter, one lowercase letter, one digit, and one special character from `@ $ ! % * ? &`
- Success contract: HTTP 200 with `message` and numeric `id`
- Relevant security requirements: SEC-01, SEC-04, SEC-05

## AI partition model

| Parameter/concern | Valid partitions | Invalid or adversarial partitions |
| --- | --- | --- |
| `name` | Non-empty string; Vietnamese/Unicode name | Missing, null, empty, whitespace-only, wrong JSON type, extreme length, stored XSS payload |
| `email` | Conventional address; uppercase; plus addressing | Missing, null, empty, whitespace, malformed structure, duplicate, case-variant duplicate, SQL injection, XSS |
| `password` | Length ≥8 with all four character classes and an allowed special | Length 7, each missing class, disallowed-only special, missing, null, empty, extreme length |
| Request contract | JSON body and required student header | Malformed JSON, wrong media type, unexpected fields/mass assignment |
| Response/security | Exact success schema; no password exposure; parameterized query | Plaintext password storage, internal SQL details, role escalation |

## Generated cases

Unless stated otherwise, each request uses `Content-Type: application/json` and `X-Student-Id: 23127414`. A unique email is used for every success candidate.

| ID | Area | Test data/change from valid baseline | Expected result derived from specification |
| --- | --- | --- | --- |
| FR01-AI-001 | Happy path/schema | `name="Nguyen Van A"`, valid unique email, `password="Valid123!"` | 200; JSON contains exactly a success `message` and numeric positive `id`; response exposes no password. |
| FR01-AI-002 | Name/Unicode | `name="Nguyễn Thị Ánh"` | 200; Unicode name is accepted and response matches the success schema. |
| FR01-AI-003 | Name boundary | `name="A"` | Accept if the only stated constraint is non-empty; response matches the success schema. |
| FR01-AI-004 | Name boundary | 255-character non-empty name | Accept because the specification defines no maximum; response matches the success schema. |
| FR01-AI-005 | Name boundary | 256-character non-empty name | Accept because the specification defines no maximum; response matches the success schema. |
| FR01-AI-006 | Name required | Omit `name` | 4xx validation error; no user is created. |
| FR01-AI-007 | Name required | `name=null` | 4xx validation error; no user is created. |
| FR01-AI-008 | Name required | `name=""` | 4xx validation error; no user is created. |
| FR01-AI-009 | Name partition | `name="   "` | 4xx validation error after trimming; no user is created. |
| FR01-AI-010 | Name type | `name=12345` | 4xx validation error; no implicit type coercion or user creation. |
| FR01-AI-011 | Email valid | `email="USER.UPPER@EXAMPLE.COM"` | 200 with success schema. |
| FR01-AI-012 | Email valid | `email="user+hw06@example.com"` | 200 with success schema. |
| FR01-AI-013 | Email boundary | `email="a@b.co"` | 200 with success schema. |
| FR01-AI-014 | Email required | Omit `email` | 4xx validation error; no user is created. |
| FR01-AI-015 | Email required | `email=null` | 4xx validation error; no user is created. |
| FR01-AI-016 | Email required | `email=""` | 4xx validation error; no user is created. |
| FR01-AI-017 | Email format | `email="   "` | 4xx validation error; no user is created. |
| FR01-AI-018 | Email format | `email="user.example.com"` (no `@`) | 4xx validation error; no user is created. |
| FR01-AI-019 | Email format | `email="@example.com"` (missing local part) | 4xx validation error; no user is created. |
| FR01-AI-020 | Email format | `email="user@"` (missing domain) | 4xx validation error; no user is created. |
| FR01-AI-021 | Email format | `email="user @example.com"` (embedded space) | 4xx validation error; no user is created. |
| FR01-AI-022 | Email uniqueness | Register the same valid email twice | First request succeeds; second returns a 4xx duplicate error and creates no second account. |
| FR01-AI-023 | Email uniqueness | Register `Case@Test.com`, then `case@test.com` | Second request is rejected as a case-insensitive duplicate. |
| FR01-AI-024 | SQL injection/SEC-05 | `email="' OR 1=1 --@example.com"` | 4xx; query is parameterized, no unrelated records change, and no SQL/internal error is exposed. |
| FR01-AI-025 | XSS/SEC-04 | `email="<script>alert(1)</script>@example.com"` | 4xx; payload is not reflected as executable content. |
| FR01-AI-026 | Password boundary | `password="Aa1!aaaa"` (exactly 8 characters) | 200 with success schema. |
| FR01-AI-027 | Password boundary | `password="Aa1!aaa"` (7 characters) | 4xx validation error; no user is created. |
| FR01-AI-028 | Password class | `password="lower123!"` (no uppercase) | 4xx validation error; no user is created. |
| FR01-AI-029 | Password class | `password="UPPER123!"` (no lowercase) | 4xx validation error; no user is created. |
| FR01-AI-030 | Password class | `password="NoDigits!"` (no digit) | 4xx validation error; no user is created. |
| FR01-AI-031 | Password class | `password="NoSpecial1"` (no special) | 4xx validation error; no user is created. |
| FR01-AI-032 | Password allowed special | `password="Valid123@"` | 200 with success schema. |
| FR01-AI-033 | Password special set | `password="Valid123#"` where `#` is the only special | 4xx because `#` is outside the specified allowed set. |
| FR01-AI-034 | Password required | Omit `password` | 4xx validation error; no user is created. |
| FR01-AI-035 | Password required | `password=null` | 4xx validation error; no user is created. |
| FR01-AI-036 | Password required | `password=""` | 4xx validation error; no user is created. |
| FR01-AI-037 | Password/SEC-01 | Register with a valid password, then inspect persisted account data through an approved local test fixture | Account is created, but the stored password is a non-plaintext salted hash and is not equal to the submitted password. |
| FR01-AI-038 | Request syntax | Send truncated/malformed JSON | 4xx JSON parsing error; no account is created and no stack trace/internal path is exposed. |
| FR01-AI-039 | Media type | Send the valid fields as `text/plain` | 415 or another documented 4xx; no account is created. |
| FR01-AI-040 | Mass assignment | Add `role="admin"`, `id=1`, and `login_attempts=0` to a valid request | Server rejects or ignores unexpected fields; any created account has role `user`; response does not expose privileged fields. |

## Coverage count

- AI-generated cases: **40**
- Human-added cases: **0** at this stage
- Executed cases: **0** at this stage
