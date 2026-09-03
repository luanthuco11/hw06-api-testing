const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const resultDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "reports", "ci-full");
const baseline = JSON.parse(fs.readFileSync(path.join(root, "reports", "execution-summary.json"), "utf8"));
const files = fs.readdirSync(resultDir)
  .filter((name) => name.endsWith(".json") && name !== "summary.json")
  .sort()
  .map((name) => path.join(resultDir, name));

const summary = {
  files: 0,
  items: 0,
  caseItems: 0,
  setupItems: 0,
  requests: 0,
  assertions: 0,
  failedAssertions: 0,
  scriptFailures: 0,
  requestFailures: 0,
};
const failingCases = new Set();

for (const file of files) {
  const result = JSON.parse(fs.readFileSync(file, "utf8"));
  const stats = result.run?.stats;
  if (!stats) throw new Error(`${file} is not a Newman JSON result`);
  const caseIds = new Set(
    (result.run.executions || [])
      .filter((execution) => /-(AI|H)-\d+\b/.test(execution.item?.name || ""))
      .map((execution) => execution.item?.id || execution.item?.name),
  );
  summary.files += 1;
  summary.items += stats.items.total;
  summary.caseItems += caseIds.size;
  summary.setupItems += stats.items.total - caseIds.size;
  summary.requests += stats.requests.total;
  summary.requestFailures += stats.requests.failed;
  summary.assertions += stats.assertions.total;
  summary.failedAssertions += stats.assertions.failed;
  summary.scriptFailures += stats.scripts.failed;
  for (const failure of result.run.failures || []) {
    if (failure.source?.name && /-(AI|H)-\d+\b/.test(failure.source.name)) {
      failingCases.add(failure.source.name.split(" ")[0]);
    }
  }
}

summary.passedAssertions = summary.assertions - summary.failedAssertions;
summary.failingCaseCount = failingCases.size;
summary.passingCaseCount = summary.caseItems - summary.failingCaseCount;
summary.failingCaseIds = [...failingCases].sort();

fs.writeFileSync(path.join(resultDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));

const keys = [
  "files", "items", "caseItems", "setupItems", "requests", "assertions",
  "failedAssertions", "scriptFailures", "passedAssertions", "failingCaseCount", "passingCaseCount",
];
const errors = [];
for (const key of keys) {
  if (summary[key] !== baseline[key]) errors.push(`${key}: expected ${baseline[key]}, received ${summary[key]}`);
}
if (summary.requestFailures !== 0) errors.push(`requestFailures: expected 0, received ${summary.requestFailures}`);
if (JSON.stringify(summary.failingCaseIds) !== JSON.stringify([...baseline.failingCaseIds].sort())) {
  errors.push("failingCaseIds differ from the accepted local baseline");
}
if (errors.length) {
  errors.forEach((error) => console.error(`BASELINE MISMATCH: ${error}`));
  process.exit(1);
}
console.log("Full audited suite matches the accepted baseline; no new regression or harness failure detected.");
