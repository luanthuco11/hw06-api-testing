# HW06 Work Plan

## Fixed decisions

- Student ID: `23127414`
- Test runner: Postman + Newman
- Scope: FR-01, FR-11, and all four FR-14 Category CRUD operations
- Per endpoint: at least 35 AI-generated cases and at least 5 independently added cases
- Advanced deliverable: reusable Agent Skill and demonstration video

## Delivery sequence

1. [x] Establish reproducible local SUT setup and test data reset.
2. [x] For each endpoint, commit AI generation, human audit/corrections, human extension, and execution evidence separately.
3. [x] Export the Postman collection, environment, fixtures, and Newman HTML reports.
4. [ ] Create GitHub Issues and attach real screenshots. Markdown defect reports are complete; browser evidence is pending.
5. [x] Add GitHub Actions, retain one passing and one intentionally failing run, and restore the final branch to passing.
6. [ ] Design and implement the API-test-generator skill, validate it, and record a demo. Implementation/validation are complete; student diagram/video remain.
7. [ ] Complete reports, spreadsheet, AI critique, commit log, PDFs, and submission archive. Documents are generated; final grade, commit log snapshot, and ZIP remain.

## Evidence constraints

- Do not fabricate execution output, defects, screenshots, CI runs, or video.
- Capture the `X-Student-Id` header from an actual Postman pre-request/console run.
- Newman evidence must show the actual SUT hostname.
- The student must make the design decisions and draw the test-generator diagram.
- Human review is required before finalizing every generated test-case set.
