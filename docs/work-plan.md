# HW06 Work Plan

## Fixed decisions

- Student ID: `23127414`
- Test runner: Postman + Newman
- Scope: FR-01, FR-11, and all four FR-14 Category CRUD operations
- Per endpoint: at least 35 AI-generated cases and at least 5 independently added cases
- Advanced deliverable: reusable Agent Skill; demonstration video is optional supporting evidence

## Delivery sequence

1. [x] Establish reproducible local SUT setup and test data reset.
2. [x] For each endpoint, commit AI generation, human audit/corrections, human extension, and execution evidence separately.
3. [x] Export the Postman collection, environment, fixtures, and Newman HTML reports.
4. [x] Create 27 GitHub Issues and attach one real representative execution screenshot to each.
5. [x] Add GitHub Actions, retain one passing and one intentionally failing run, and restore the final branch to passing.
6. [x] Design and implement the API-test-generator skill, validate it, and provide a student-reviewed diagram. A demo video remains optional.
7. [ ] Complete reports, spreadsheet, AI critique, commit log, PDFs, and submission archive. Core documents are generated; AI interaction times/raw export, final grade, refreshed outputs, and ZIP remain.

## Evidence constraints

- Do not fabricate execution output, defects, screenshots, CI runs, or video.
- Capture the `X-Student-Id` header from an actual Postman pre-request/console run.
- Newman evidence must show the actual SUT hostname.
- The student must inspect and approve the generated diagram, as clarified by the teacher.
- Human review is required before finalizing every generated test-case set.
