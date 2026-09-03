const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, ".github", "issue-drafts");
fs.mkdirSync(output, { recursive: true });

const source = fs.readFileSync(path.join(root, "docs", "bug-summary.md"), "utf8");
const rows = source.split(/\r?\n/)
  .filter((line) => /^\| BUG-/.test(line))
  .map((line) => line.split("|").slice(1, -1).map((value) => value.replace(/`|\*\*/g, "").trim()));

const reportByPrefix = {
  "BUG-FR01": "test-cases/fr01-register/execution-results.md",
  "BUG-FR11": "test-cases/fr11-order-history/execution-results.md",
  "BUG-FR14GET": "test-cases/fr14-get-categories/execution-results.md",
  "BUG-FR14POST": "test-cases/fr14-post-categories/execution-results.md",
  "BUG-FR14PUT": "test-cases/fr14-put-categories/execution-results.md",
  "BUG-FR14DELETE": "test-cases/fr14-delete-categories/execution-results.md",
};
const fixtureByPrefix = {
  "BUG-FR01": "Use the FR-01 clean registration fixture and collection folder.",
  "BUG-FR11": "Start the SUT, then run scripts/prepare-fr11-fixture.js before the FR-11 folders.",
  "BUG-FR14GET": "Start the SUT, prepare the fixture mode named in the GET execution report, then run its folder.",
  "BUG-FR14POST": "Start the SUT, then run scripts/prepare-fr14-post-fixture.js before the POST folders.",
  "BUG-FR14PUT": "Start the SUT, then run scripts/prepare-fr14-put-fixture.js before the PUT folders.",
  "BUG-FR14DELETE": "Start the SUT, then run the single/main DELETE fixture documented in the execution report.",
};

for (const [id, endpoint, finding, severity] of rows) {
  const prefix = Object.keys(reportByPrefix).find((candidate) => id.startsWith(candidate));
  if (!prefix) throw new Error(`No report mapping for ${id}`);
  const title = `[${id}] ${finding}`;
  const body = `# ${title}

## Summary

- Endpoint/area: ${endpoint}
- Finding: ${finding}
- Proposed severity: ${severity}
- SUT commit: \`85af3ba875c88283615e22cb108f13e2fccaf0e9\`
- Student ID/header: \`23127414\` / \`X-Student-Id: 23127414\`

## Reproduction

1. Check out the SUT at the pinned commit and install backend dependencies.
2. ${fixtureByPrefix[prefix]}
3. Run the matching Postman folder with Newman.
4. Compare the failed test IDs, expected result, actual result, and impact in [the execution report](../../${reportByPrefix[prefix]}).

## Evidence

- Newman HTML reports: [reports/newman](../../reports/newman)
- Detailed defect section: [${reportByPrefix[prefix]}](../../${reportByPrefix[prefix]})
- Screenshot: **ATTACH A REAL NEWMAN/POSTMAN SCREENSHOT BEFORE PUBLISHING THIS ISSUE.**

## Notes

This draft is generated from an executed, human-audited contract test. Replace the screenshot placeholder with attributable UI evidence; do not use fabricated images.
`;
  fs.writeFileSync(path.join(output, `${id}.md`), body, "utf8");
}
fs.writeFileSync(path.join(output, "README.md"), `# GitHub Issue Drafts

Generated drafts: **${rows.length}**.

Before publishing each draft:

1. Open the linked Newman HTML report.
2. Capture a real screenshot showing the case ID, request/response, and failed assertion.
3. Attach the image to the GitHub Issue and replace the screenshot placeholder.
4. Verify severity and avoid duplicating an already published root cause.

These files are drafts, not proof that GitHub Issues or screenshots already exist.
`, "utf8");
console.log(`Generated ${rows.length} GitHub Issue drafts in ${output}.`);
