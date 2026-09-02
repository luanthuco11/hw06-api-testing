# AI Audit Report

## Declaration

I use AI tools for the following tasks.

## Session log

| Date | AI tool | Student prompt / instruction | AI output and resulting action | Human review |
| --- | --- | --- | --- | --- |
| 2026-09-02 | OpenAI Codex | Read the HW06 PDF, create an empty GitHub repository, and prepare a plan without making unapproved decisions. | Read the eight-page assignment, created the public empty repository `luanthuco11/hw06-api-testing`, and identified decisions required from the student. | Student confirmed repository owner, name, visibility, student ID, tools, feature scope, and Agent Skill/video scope. |
| 2026-09-02 | OpenAI Codex | Read HW2 to determine the previously selected pools/features. | Identified FR-01 from Pool A, FR-11 from Pool B, FR-14 from Pool C, and FR-02 Mobile from Pool D. | Student confirmed reuse of FR-01, FR-11, and all FR-14 CRUD operations. |
| 2026-09-02 | OpenAI Codex | Clone the teacher SUT and the assignment repository, then verify the backend. | Cloned both repositories, installed backend dependencies, seeded SQLite, and smoke-tested categories, login/JWT, and personal order history using `X-Student-Id: 23127414`. | Execution results were checked against terminal output; no assignment test cases were claimed at this stage. |
| 2026-09-02 | OpenAI Codex | Continue the assignment. | Created the initial repository structure, scope, execution plan, evidence rules, and Newman tool configuration. | Pending student review of generated test cases and final deliverables. |

Subsequent AI interactions will be appended with prompts, outputs, corrections, and accepted/rejected decisions.
