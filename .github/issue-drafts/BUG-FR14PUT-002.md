# [BUG-FR14PUT-002] Parser/media errors disclose internals or return 500

## Summary

- Endpoint/area: Category PUT
- Finding: Parser/media errors disclose internals or return 500
- Proposed severity: High
- SUT commit: `85af3ba875c88283615e22cb108f13e2fccaf0e9`
- Student ID/header: `23127414` / `X-Student-Id: 23127414`

## Reproduction

1. Check out the SUT at the pinned commit and install backend dependencies.
2. Start the SUT, then run scripts/prepare-fr14-put-fixture.js before the PUT folders.
3. Run the matching Postman folder with Newman.
4. Compare the failed test IDs, expected result, actual result, and impact in [the execution report](../../test-cases/fr14-put-categories/execution-results.md).

## Evidence

- Newman HTML reports: [reports/newman](../../reports/newman)
- Detailed defect section: [test-cases/fr14-put-categories/execution-results.md](../../test-cases/fr14-put-categories/execution-results.md)
- Screenshot: **ATTACH A REAL NEWMAN/POSTMAN SCREENSHOT BEFORE PUBLISHING THIS ISSUE.**

## Notes

This draft is generated from an executed, human-audited contract test. Replace the screenshot placeholder with attributable UI evidence; do not use fabricated images.
