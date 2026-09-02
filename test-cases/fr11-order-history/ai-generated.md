# FR-11 User Order History — AI-Generated Test Cases

Status: unreviewed AI output. These cases must be audited before implementation or execution.

## Input supplied to the AI

- Feature: FR-11 User Order History
- Endpoint: `GET /api/orders/my-orders`
- Required headers: `Authorization: Bearer <token>` and `X-Student-Id: 23127414`
- A user may view only their own orders
- Required displayed data: order ID, creation date, total amount, and current status
- Valid statuses: `pending`, `confirmed`, `shipping`, `delivered`, `canceled`
- Relevant security requirement: SEC-02

## AI partition model

| Concern | Partitions |
| --- | --- |
| Authentication | Valid user JWT; missing, empty, malformed, expired, tampered, wrong scheme, unsupported algorithm |
| Ownership | No orders; one/many own orders; another user's orders; admin using the personal endpoint; query/path manipulation |
| Order data | Each valid status; zero/positive/large total; Unicode address; chronological ordering |
| Schema | Array response; exact order keys/types; no password or unrelated user data; JSON content type |
| Robustness | Repeated request, concurrent request, unsupported method, response-time observation |

## Generated cases

Every request carries `X-Student-Id: 23127414` including negative authentication tests.

| ID | Area | Scenario | Expected result derived from specification |
| --- | --- | --- | --- |
| FR11-AI-001 | Empty state | Valid JWT for a user with no orders | 200 and `[]`. |
| FR11-AI-002 | Single order | Valid JWT for a user with exactly one own order | 200 array of length 1 containing that order. |
| FR11-AI-003 | Multiple orders | Valid JWT for a user with three own orders | 200 array of length 3; no other user's order appears. |
| FR11-AI-004 | Ordering | Own orders have increasing IDs/timestamps | 200 ordered newest first. |
| FR11-AI-005 | Schema | One normal own order | Each item contains exactly `id`, `created_at`, `total_amount`, and `status`. |
| FR11-AI-006 | Schema types | One normal own order | `id` is positive integer, `created_at` is parseable date-time, `total_amount` is numeric, `status` is string. |
| FR11-AI-007 | Status domain | Own order is `pending` | 200 and status remains `pending`. |
| FR11-AI-008 | Status domain | Own order is `confirmed` | 200 and status remains `confirmed`. |
| FR11-AI-009 | Status domain | Own order is `shipping` | 200 and status remains `shipping`. |
| FR11-AI-010 | Status domain | Own order is `delivered` | 200 and status remains `delivered`. |
| FR11-AI-011 | Status domain | Own order is `canceled` | 200 and status remains `canceled`. |
| FR11-AI-012 | Total boundary | Own order total is `0` | Return the stored numeric value without coercion; validity of creating that order is outside FR-11. |
| FR11-AI-013 | Total domain | Own order total is `1` | Return numeric `1`. |
| FR11-AI-014 | Total domain | Own order total is a large safe integer | Return the same numeric value without truncation. |
| FR11-AI-015 | Unicode data | Own order has Vietnamese shipping address | 200 valid UTF-8 JSON; no corruption. |
| FR11-AI-016 | Authentication | Omit `Authorization` | 401 JSON error; no order data. |
| FR11-AI-017 | Authentication | `Authorization` is empty | 401 JSON error; no order data. |
| FR11-AI-018 | Authentication | Header is `Bearer` with no token | 401 JSON error; no order data. |
| FR11-AI-019 | Authentication | Header is `Bearer ` with blank token | 401 JSON error; no order data. |
| FR11-AI-020 | Authentication | Three-segment but invalid JWT | 403 JSON error; no order data. |
| FR11-AI-021 | Authentication | Syntactically malformed one-segment token | 403 JSON error; no order data. |
| FR11-AI-022 | Authentication | Correctly signed but expired JWT | 403 JSON error; no order data. |
| FR11-AI-023 | Authentication | Change JWT payload without resigning | 403 JSON error; no order data. |
| FR11-AI-024 | Authentication | JWT with algorithm `none` | 403 JSON error; no order data. |
| FR11-AI-025 | Auth scheme | Use `Basic <jwt>` | 401 because the required scheme is Bearer. |
| FR11-AI-026 | Auth scheme | Use lowercase `bearer <jwt>` | 200 because HTTP authentication schemes are case-insensitive. |
| FR11-AI-027 | Auth formatting | Use two spaces between `Bearer` and token | 401; malformed credentials are rejected. |
| FR11-AI-028 | Deleted principal | Correctly signed JWT references a user that no longer exists | 401/404 and no data. |
| FR11-AI-029 | Admin isolation | Valid admin JWT calls personal history | 200 with only the admin's own orders, usually an empty array. |
| FR11-AI-030 | Ownership | User A and User B each have orders; call with User A JWT | Only User A's order IDs are returned. |
| FR11-AI-031 | Query manipulation | Add `?user_id=<UserB>` while using User A JWT | Query parameter is ignored or rejected; no User B order appears. |
| FR11-AI-032 | Query manipulation | Add `?user_id=' OR 1=1 --` | 200 containing only the authenticated user's orders; no SQL error or leakage. |
| FR11-AI-033 | Query manipulation | Add `?role=admin` using normal user JWT | No privilege change; only that user's orders appear. |
| FR11-AI-034 | Data minimization | User has one order | Response contains no password, reset token, login counter, or unrelated user profile. |
| FR11-AI-035 | Cross-user cardinality | User A has 0 orders and User B has 100 | User A receives `[]`; response length is unaffected by User B. |
| FR11-AI-036 | Repeatability | Send the same valid GET twice without mutations | Both responses are equivalent and no new order is created. |
| FR11-AI-037 | Concurrency | Send ten valid GET requests concurrently | Each response is 200 and contains the same authorized order set. |
| FR11-AI-038 | Method contract | Send `POST /api/orders/my-orders` | 404/405 and no data mutation. |
| FR11-AI-039 | Response media | Normal valid request | `Content-Type` is JSON and body parses as an array. |
| FR11-AI-040 | Performance observation | Normal seeded dataset | Response completes within 2 seconds locally; threshold is a test-environment observation, not a specified SLA. |

## Coverage count

- AI-generated cases: **40**
- Human-added cases: **0** at this stage
- Executed cases: **0** at this stage
