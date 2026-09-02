# FR-14 GET Categories — AI-Generated Test Cases

Status: unreviewed AI output.

## Contract supplied to the AI

- Feature: FR-14 Category Management
- Endpoint: `GET /api/categories`
- Required output: category list
- Category name is required and non-empty when categories are created
- Read-only GET is public; FR-12 requires admin authorization for data-changing category operations
- Required assignment header: `X-Student-Id: 23127414`

## Generated cases

| ID | Area | Scenario | Expected result derived from specification |
| --- | --- | --- | --- |
| FR14GET-AI-001 | Baseline | Fresh seed contains three categories | 200 JSON array containing the three seeded categories. |
| FR14GET-AI-002 | Empty state | Database contains no categories | 200 and `[]`. |
| FR14GET-AI-003 | Cardinality | Database contains exactly one category | 200 array of length 1. |
| FR14GET-AI-004 | Cardinality | Database contains 100 categories | 200 array of length 100 without truncation. |
| FR14GET-AI-005 | Schema | One valid category | Each item contains exactly `id` and `name`. |
| FR14GET-AI-006 | ID type | One valid category | `id` is a positive integer. |
| FR14GET-AI-007 | Name type | One valid category | `name` is a non-empty string. |
| FR14GET-AI-008 | Unicode | Category name is `Điện thoại` | UTF-8 characters are returned unchanged. |
| FR14GET-AI-009 | Unicode | Category name contains composed Vietnamese accents | JSON remains valid and text is not corrupted. |
| FR14GET-AI-010 | Name boundary | Category name contains one character | Return stored category; creation validity is evaluated by POST tests. |
| FR14GET-AI-011 | Name boundary | Category name contains 255 characters | Return complete value without truncation. |
| FR14GET-AI-012 | Name boundary | Category name contains 256 characters | Return complete value without truncation. |
| FR14GET-AI-013 | Duplicate data | Two categories have the same name | Return both distinct IDs; GET does not silently merge rows. |
| FR14GET-AI-014 | Corrupt data | Preloaded category has empty name | Return behavior is observed; FR-14 does not define recovery for corrupt stored rows. |
| FR14GET-AI-015 | Corrupt data | Preloaded category has null name | Return behavior is observed without server crash. |
| FR14GET-AI-016 | XSS data | Stored name is `<script>alert(1)</script>` | JSON returns inert text; no HTML response or script execution. |
| FR14GET-AI-017 | SQL-like data | Stored name is `x' OR 1=1 --` | Return literal value without SQL error or additional rows. |
| FR14GET-AI-018 | Status | Normal request | HTTP 200. |
| FR14GET-AI-019 | Media type | Normal request | `Content-Type` contains `application/json`. |
| FR14GET-AI-020 | Response parsing | Normal request | Body parses as a JSON array. |
| FR14GET-AI-021 | Data minimization | Normal request | No password, token, role, user, or product details appear. |
| FR14GET-AI-022 | Public access | Omit Authorization | 200 because category reads are public. |
| FR14GET-AI-023 | Public access | Send an invalid Bearer token | Same result as unauthenticated request; no private data appears. |
| FR14GET-AI-024 | Public access | Send a valid normal-user token | Same category set as unauthenticated request. |
| FR14GET-AI-025 | Public access | Send a valid admin token | Same category set as unauthenticated request. |
| FR14GET-AI-026 | Unknown query | Add `?search=phone` | Unknown query is ignored; full category list is returned. |
| FR14GET-AI-027 | Unknown query | Add `?page=1&limit=1` | Unknown pagination parameters are ignored; list is not truncated. |
| FR14GET-AI-028 | Unknown query | Add `?sort=name&order=desc` | Unknown sort parameters are ignored; no error or mutation. |
| FR14GET-AI-029 | Query isolation | Add `?user_id=1&role=admin` | Query does not change access or response fields. |
| FR14GET-AI-030 | Query injection | Add URL-encoded `' OR 1=1 --` | 200 normal list; no SQL/internal error and no extra rows. |
| FR14GET-AI-031 | Repeatability | Send the same GET twice | Equivalent response bodies and no database mutation. |
| FR14GET-AI-032 | Concurrency | Send ten GET requests concurrently | All return 200 with equivalent category sets. |
| FR14GET-AI-033 | Method contract | Send `PATCH /api/categories` | 404 because no such route exists; no mutation. |
| FR14GET-AI-034 | CORS preflight | Send OPTIONS with an Origin and requested GET method | Controlled preflight response permits GET without exposing credentials unexpectedly. |
| FR14GET-AI-035 | Accept header | `Accept: application/json` | 200 JSON array. |
| FR14GET-AI-036 | Accept mismatch | `Accept: text/html` | 406 or documented JSON fallback; no HTML injection. |
| FR14GET-AI-037 | Conditional request | Repeat request with returned ETag in `If-None-Match` | 304 with empty body if ETag is supported; otherwise a normal 200. |
| FR14GET-AI-038 | Cache behavior | Normal public read | Record cache headers; no cache policy is specified. |
| FR14GET-AI-039 | Performance observation | Fresh seed | Complete locally within two seconds; threshold is not a specified SLA. |
| FR14GET-AI-040 | Non-mutation | Compare database/category count before and after repeated GETs | Count and values are unchanged. |

## Coverage count

- AI-generated cases: **40**
- Human-added cases: **0**
- Executed cases: **0**
