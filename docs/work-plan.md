# HW06 Work Plan

## Fixed decisions

- Student ID: `23127414`
- Test runner: Postman + Newman
- Scope: FR-01, FR-11, and all four FR-14 Category CRUD operations
- Per endpoint: at least 35 AI-generated cases and at least 5 independently added cases
- Advanced deliverable: reusable Agent Skill and demonstration video

## Delivery sequence

1. Establish reproducible local SUT setup and test data reset.
2. For each endpoint, commit AI generation, human audit/corrections, human extension, and execution evidence separately.
3. Export the Postman collection, environment, data files, and Newman HTML report.
4. Report genuine defects in Markdown and GitHub Issues with real screenshots.
5. Add GitHub Actions and retain links to one passing and one intentionally failing run; restore the final branch to passing.
6. Design and implement the API-test-generator skill, validate it, and record a demo.
7. Complete the reports, spreadsheet, AI critique, commit log, PDFs, and submission archive.

## Evidence constraints

- Do not fabricate execution output, defects, screenshots, CI runs, or video.
- Capture the `X-Student-Id` header from an actual Postman pre-request/console run.
- Newman evidence must show the actual SUT hostname.
- The student must make the design decisions and draw the test-generator diagram.
- Human review is required before finalizing every generated test-case set.
