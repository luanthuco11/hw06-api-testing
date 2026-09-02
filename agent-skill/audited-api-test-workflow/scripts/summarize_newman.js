#!/usr/bin/env node
const fs = require("fs");

if (process.argv.length < 3) {
  console.error("Usage: node summarize_newman.js <newman-result.json> [...]");
  process.exit(2);
}
const total = { files: 0, items: 0, caseItems: 0, setupItems: 0, requests: 0, assertions: 0, failedAssertions: 0, scriptFailures: 0 };
const failingCases = new Set();
for (const file of process.argv.slice(2)) {
  const result = JSON.parse(fs.readFileSync(file, "utf8"));
  const stats = result.run?.stats;
  if (!stats) throw new Error(`${file} is not a Newman JSON result`);
  total.files += 1;
  total.items += stats.items.total;
  const caseItemIds = new Set(
    (result.run.executions || [])
      .filter((execution) => /-(AI|H)-\d+\b/.test(execution.item?.name || ""))
      .map((execution) => execution.item?.id || execution.item?.name),
  );
  const caseItems = caseItemIds.size;
  total.caseItems += caseItems;
  total.setupItems += stats.items.total - caseItems;
  total.requests += stats.requests.total;
  total.assertions += stats.assertions.total;
  total.failedAssertions += stats.assertions.failed;
  total.scriptFailures += stats.scripts.failed;
  for (const failure of result.run.failures || []) {
    if (failure.source?.name) failingCases.add(failure.source.name.split(" ")[0]);
  }
}
const summary = {
  ...total,
  passedAssertions: total.assertions - total.failedAssertions,
  failingCaseCount: failingCases.size,
  casesWithoutFailedAssertion: total.caseItems - failingCases.size,
  failingCaseIds: [...failingCases].sort(),
};
console.log(JSON.stringify(summary, null, 2));
