const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const root = path.resolve(__dirname, "..");
const runtimeCandidates = [path.resolve(root, "..", ".runtime"), path.resolve(root, "..")];
const runtime = runtimeCandidates.find((candidate) => fs.existsSync(path.join(candidate, "fr01")));
if (!runtime) throw new Error(`Cannot locate raw Newman evidence. Checked: ${runtimeCandidates.join(", ")}`);
const reports = path.join(root, "reports");
fs.mkdirSync(reports, { recursive: true });

const endpoints = [
  { key: "FR01", name: "FR-01 Register", route: "POST /api/register", dir: "fr01-register" },
  { key: "FR11", name: "FR-11 Order History", route: "GET /api/orders/my-orders", dir: "fr11-order-history" },
  { key: "FR14GET", name: "FR-14 Category GET", route: "GET /api/categories", dir: "fr14-get-categories" },
  { key: "FR14POST", name: "FR-14 Category POST", route: "POST /api/categories", dir: "fr14-post-categories" },
  { key: "FR14PUT", name: "FR-14 Category PUT", route: "PUT /api/categories/:id", dir: "fr14-put-categories" },
  { key: "FR14DELETE", name: "FR-14 Category DELETE", route: "DELETE /api/categories/:id", dir: "fr14-delete-categories" },
];
const resultFiles = [
  "fr01/fr01-results.json", "fr11/fr11-results.json",
  "fr14get/default.json", "fr14get/empty.json", "fr14get/one.json", "fr14get/hundred.json", "fr14get/main.json", "fr14get/large.json",
  "fr14post/results.json", "fr14put/results.json", "fr14delete/single.json", "fr14delete/main.json",
].map((file) => path.join(runtime, file));

const clean = (value) => String(value || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
function tableRows(file, idPattern) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  return lines
    .filter((line) => line.startsWith("|") && idPattern.test(line))
    .map((line) => line.split("|").slice(1, -1).map(clean));
}
function auditVerdict(id) {
  const number = Number(id.match(/(\d+)$/)?.[1]);
  if (id.startsWith("FR01-AI-")) {
    if ([3, 4, 5, 40].includes(number)) return "INCOMPLETE";
    if ([23, 24, 25].includes(number)) return "INVALID / CORRECTED";
  }
  if (id.startsWith("FR11-AI-")) {
    if ([12, 40].includes(number)) return "INCOMPLETE";
    if ([15, 32].includes(number)) return "INVALID / CORRECTED";
  }
  if (id.startsWith("FR14GET-AI-") && [14, 15, 36, 37, 38, 39].includes(number)) return "INCOMPLETE";
  if ((id.startsWith("FR14POST-AI-") || id.startsWith("FR14PUT-AI-")) && [5, 6].includes(number)) return "INCOMPLETE";
  return "VALID";
}

const failingIds = new Set();
const execution = { files: 0, items: 0, caseItems: 0, setupItems: 0, requests: 0, assertions: 0, failedAssertions: 0, scriptFailures: 0 };
for (const file of resultFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing Newman evidence: ${file}`);
  const result = JSON.parse(fs.readFileSync(file, "utf8"));
  const stats = result.run.stats;
  execution.files += 1;
  execution.items += stats.items.total;
  execution.requests += stats.requests.total;
  execution.assertions += stats.assertions.total;
  execution.failedAssertions += stats.assertions.failed;
  execution.scriptFailures += stats.scripts.failed;
  const caseIds = new Set();
  for (const run of result.run.executions || []) {
    const id = String(run.item?.name || "").split(" ")[0];
    if (/-(AI|H)-\d+$/.test(id)) caseIds.add(run.item.id || id);
  }
  execution.caseItems += caseIds.size;
  execution.setupItems += stats.items.total - caseIds.size;
  for (const failure of result.run.failures || []) {
    const id = String(failure.source?.name || "").split(" ")[0];
    if (/-(AI|H)-\d+$/.test(id)) failingIds.add(id);
  }
}
execution.passedAssertions = execution.assertions - execution.failedAssertions;
execution.failingCaseCount = failingIds.size;
execution.passingCaseCount = execution.caseItems - failingIds.size;
execution.studentId = "23127414";
execution.sutCommit = "85af3ba875c88283615e22cb108f13e2fccaf0e9";
execution.generatedAt = new Date().toISOString();
execution.failingCaseIds = [...failingIds].sort();
fs.writeFileSync(path.join(reports, "execution-summary.json"), `${JSON.stringify(execution, null, 2)}\n`, "utf8");
const commitLog = execFileSync("git", ["log", "--reverse", "--date=iso-strict", "--pretty=format:%h%x09%ad%x09%s"], {
  cwd: root,
  encoding: "utf8",
}).trim();
fs.writeFileSync(path.join(reports, "commit-log.txt"), `${commitLog}\n`, "utf8");

const cases = [];
for (const endpoint of endpoints) {
  const dir = path.join(root, "test-cases", endpoint.dir);
  for (const row of tableRows(path.join(dir, "ai-generated.md"), /-(AI)-\d+/)) {
    const [id, area, scenario, expected] = row;
    cases.push({ id, endpoint: endpoint.name, route: endpoint.route, source: "AI-generated", area, scenario, preconditions: "", expected, verdict: auditVerdict(id), result: failingIds.has(id) ? "FAIL" : "PASS" });
  }
  for (const row of tableRows(path.join(dir, "human-added.md"), /-(H)-\d+/)) {
    const [id, scenario, preconditions, expected, whyMissed] = row;
    cases.push({ id, endpoint: endpoint.name, route: endpoint.route, source: "Human-added", area: "Student extension", scenario, preconditions, expected, verdict: "HUMAN-ADDED", result: failingIds.has(id) ? "FAIL" : "PASS", whyMissed });
  }
}
if (cases.length !== 279) throw new Error(`Expected 279 test cases, parsed ${cases.length}`);

const defectRows = tableRows(path.join(root, "docs", "bug-summary.md"), /BUG-/).map(([id, endpoint, finding, severity]) => ({ id, endpoint, finding, severity }));
if (defectRows.length !== 27) throw new Error(`Expected 27 defects, parsed ${defectRows.length}`);

const workbook = new ExcelJS.Workbook();
workbook.creator = "Student 23127414";
workbook.subject = "HW06 API testing evidence";
workbook.created = new Date("2026-09-03T00:00:00+07:00");
const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
const headerFont = { bold: true, color: { argb: "FFFFFFFF" } };
function styleSheet(sheet, widths) {
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
  sheet.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; cell.alignment = { vertical: "middle", wrapText: true }; });
  widths.forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.eachCell((cell) => { cell.alignment = { vertical: "top", wrapText: true }; }); });
}

const summary = workbook.addWorksheet("Summary");
summary.addRow(["Metric", "Value"]);
for (const [metric, value] of [
  ["Student ID", "23127414"], ["SUT commit", execution.sutCommit], ["AI-generated cases", 240], ["Human-added cases", 39],
  ["Executed cases", execution.caseItems], ["Setup items", execution.setupItems], ["HTTP requests", execution.requests], ["Assertions", execution.assertions],
  ["Passed assertions", execution.passedAssertions], ["Failed assertions", execution.failedAssertions], ["Passing cases", execution.passingCaseCount],
  ["Failing cases", execution.failingCaseCount], ["Confirmed defect candidates", defectRows.length], ["Script failures in accepted runs", execution.scriptFailures],
]) summary.addRow([metric, value]);
summary.addRow([]); summary.addRow(["Endpoint", "AI", "Human", "Cases"]);
for (const endpoint of endpoints) {
  const own = cases.filter((testCase) => testCase.endpoint === endpoint.name);
  summary.addRow([endpoint.name, own.filter((x) => x.source === "AI-generated").length, own.filter((x) => x.source === "Human-added").length, own.length]);
}
styleSheet(summary, [38, 70, 14, 14]);

const tests = workbook.addWorksheet("All Test Cases");
tests.columns = [
  { header: "ID", key: "id" }, { header: "Endpoint", key: "endpoint" }, { header: "Route", key: "route" }, { header: "Source", key: "source" },
  { header: "Area", key: "area" }, { header: "Scenario", key: "scenario" }, { header: "Preconditions / Steps", key: "preconditions" },
  { header: "Expected Result", key: "expected" }, { header: "Audit Verdict", key: "verdict" }, { header: "Execution", key: "result" }, { header: "Why AI Missed It", key: "whyMissed" },
];
cases.forEach((testCase) => tests.addRow(testCase));
styleSheet(tests, [24, 25, 32, 16, 18, 45, 60, 60, 22, 12, 60]);
tests.getColumn("result").eachCell((cell, row) => { if (row > 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cell.value === "PASS" ? "FFC6EFCE" : "FFFFC7CE" } }; });

const defects = workbook.addWorksheet("Defects");
defects.columns = [{ header: "ID", key: "id" }, { header: "Endpoint", key: "endpoint" }, { header: "Finding", key: "finding" }, { header: "Severity", key: "severity" }];
defectRows.forEach((defect) => defects.addRow(defect));
styleSheet(defects, [25, 24, 75, 14]);

const audit = workbook.addWorksheet("AI Audit Summary");
audit.addRow(["Endpoint", "VALID", "INVALID / corrected", "INCOMPLETE", "AI total"]);
for (const endpoint of endpoints) {
  const own = cases.filter((x) => x.endpoint === endpoint.name && x.source === "AI-generated");
  audit.addRow([endpoint.name, own.filter((x) => x.verdict === "VALID").length, own.filter((x) => x.verdict === "INVALID / CORRECTED").length, own.filter((x) => x.verdict === "INCOMPLETE").length, own.length]);
}
styleSheet(audit, [30, 14, 22, 18, 14]);

const reportFiles = ["test-report.md", "postman-features.md", "bug-summary.md", "ai-audit.md", "ai-critique.md", "ci-evidence.md", "agent-skill-pseudocode.md"];

function writeMarkdownReport() {
  const sections = reportFiles.map((file) => fs.readFileSync(path.join(root, "docs", file), "utf8").trim());
  sections.push([
    "# Agent Skill Generator Diagram",
    "",
    "![Audited API Test Generator workflow](../docs/agent-skill-diagram.png)",
    "",
    "Editable Mermaid source: [`docs/agent-skill-diagram.mmd`](../docs/agent-skill-diagram.mmd)",
  ].join("\n"));
  fs.writeFileSync(path.join(reports, "HW06_Report_23127414.md"), `${sections.join("\n\n\\newpage\n\n")}\n`, "utf8");
}

async function writePdf() {
  const output = path.join(reports, "HW06_Report_23127414.pdf");
  const doc = new PDFDocument({ size: "A4", margins: { top: 42, bottom: 42, left: 46, right: 46 }, info: { Title: "HW06 API Testing Report - 23127414", Author: "Student 23127414" } });
  const stream = fs.createWriteStream(output);
  doc.pipe(stream);
  const regularCandidates = ["C:/Windows/Fonts/arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"];
  const boldCandidates = ["C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"];
  const regular = regularCandidates.find(fs.existsSync);
  const bold = boldCandidates.find(fs.existsSync);
  if (regular) doc.registerFont("Body", regular); else doc.registerFont("Body", "Helvetica");
  if (bold) doc.registerFont("Bold", bold); else doc.registerFont("Bold", "Helvetica-Bold");
  for (const [fileIndex, file] of reportFiles.entries()) {
    if (fileIndex) doc.addPage();
    const lines = fs.readFileSync(path.join(root, "docs", file), "utf8").split(/\r?\n/);
    for (const source of lines) {
      const line = clean(source.replace(/^[-*] /, "• "));
      if (!line) { doc.moveDown(0.35); continue; }
      if (source.startsWith("# ")) doc.font("Bold").fontSize(18).fillColor("#17365D").text(line.replace(/^# /, ""), { paragraphGap: 8 });
      else if (source.startsWith("## ")) doc.font("Bold").fontSize(13).fillColor("#1F4E78").text(line.replace(/^## /, ""), { paragraphGap: 5 });
      else if (source.startsWith("### ")) doc.font("Bold").fontSize(10.5).fillColor("#1F4E78").text(line.replace(/^### /, ""), { paragraphGap: 3 });
      else if (source.startsWith("|")) doc.font("Body").fontSize(6.8).fillColor("#000000").text(line, { paragraphGap: 1 });
      else doc.font("Body").fontSize(9).fillColor("#000000").text(line, { align: "left", paragraphGap: 3, lineGap: 1 });
    }
  }
  const diagram = path.join(root, "docs", "agent-skill-diagram.png");
  if (fs.existsSync(diagram)) {
    doc.addPage();
    doc.font("Bold").fontSize(18).fillColor("#17365D").text("Agent Skill Generator Diagram", { paragraphGap: 8 });
    doc.font("Body").fontSize(8).fillColor("#000000").text("Student-reviewed AI-assisted diagram. The full-resolution PNG and editable Mermaid source are included in docs/.", { paragraphGap: 6 });
    doc.image(diagram, { fit: [doc.page.width - 92, doc.page.height - 145], align: "center", valign: "center" });
  }
  doc.end();
  await new Promise((resolve, reject) => { stream.on("finish", resolve); stream.on("error", reject); });
}

(async () => {
  writeMarkdownReport();
  await workbook.xlsx.writeFile(path.join(reports, "HW06_Test_Cases_23127414.xlsx"));
  await writePdf();
  console.log(`Generated ${cases.length} Excel test rows, ${defectRows.length} defects, execution summary, Markdown report, and PDF report.`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
