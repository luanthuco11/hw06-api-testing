# FR-01 Registration — Human-Added Test Cases

The student selected these five cases on 2026-09-02 after reviewing candidate gaps in the AI-generated set.

| ID | Student-selected scenario | Preconditions and steps | Expected result / oracle | Why the AI missed it |
| --- | --- | --- | --- | --- |
| FR01-H-001 | Concurrent duplicate registration | Generate one unused email. Send two equivalent valid registration requests concurrently with that email. Query the test fixture afterward. | Exactly one request returns 200, the other returns 409, and exactly one account exists for the email. | The first AI pass partitioned individual fields but did not model a race between requests or atomic uniqueness enforcement. |
| FR01-H-002 | Valid retry after rejected password | Submit a unique email with a seven-character password; verify HTTP 400. Resubmit the same name/email with `Valid123!`. | First request returns 400 and creates nothing; second returns 200, proving a failed validation did not reserve or partially persist the email. | The AI generated independent password cases but did not connect failure and recovery in a sequence. |
| FR01-H-003 | Prototype-pollution keys | Submit otherwise valid JSON containing `"__proto__":{"role":"admin"}` and `"constructor":{"prototype":{"role":"admin"}}`. | HTTP 400 under the strict-input oracle; no privileged fields or prototype state are introduced and no admin account is created. | The AI checked flat mass assignment but not JavaScript object-prototype attack keys. |
| FR01-H-004 | Oversized JSON body | Submit a registration body larger than the configured request limit, then immediately call a normal read-only endpoint. | Oversized request returns 413 without stack trace; the subsequent request succeeds, showing the service remains available. | The AI focused on logical field values rather than transport/resource-exhaustion boundaries. |
| FR01-H-005 | Registration burst/rate limiting | Send 100 syntactically valid registration attempts within 60 seconds from one runner identity while using unique emails. | Exploratory hardening oracle: observe at least one 429 and a retry hint if rate limiting exists; service must remain responsive. Absence of 429 is recorded as a hardening gap, not a specification defect, because FR-01/SEC-01–07 define no rate-limit threshold. | The AI treated requests independently and did not model sustained abuse or operational controls. |

## Human extension summary

- Student-selected cases: **5**
- Conformance cases with explicit specification/security invariants: **3**
- Security hardening/exploratory cases: **2**
- Execution status: **not yet executed**
