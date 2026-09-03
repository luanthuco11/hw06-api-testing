const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "reports", "ci-full");
const collection = path.join(root, "postman", "eshop-hw06.postman_collection.json");
const environment = path.join(root, "postman", "local.postman_environment.json");
const newman = path.join(root, "node_modules", "newman", "bin", "newman.js");

fs.mkdirSync(output, { recursive: true });

function execute(label, command, args, options = {}) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, args, {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    stdio: "inherit",
    ...options,
  });
  return result.status ?? 1;
}

function fixture(script, mode) {
  const args = [path.join(root, "scripts", script)];
  if (mode) args.push(mode);
  const status = execute(`Fixture: ${script}${mode ? ` ${mode}` : ""}`, process.execPath, args);
  if (status !== 0) throw new Error(`Fixture failed: ${script}${mode ? ` ${mode}` : ""}`);
}

function run(name, folders) {
  const json = path.join(output, `${name}.json`);
  const html = path.join(output, `${name}.html`);
  const args = [
    newman,
    "run", collection,
    "-e", environment,
    "--reporters", "cli,json,htmlextra",
    "--reporter-json-export", json,
    "--reporter-htmlextra-export", html,
  ];
  for (const folder of folders) args.push("--folder", folder);
  const status = execute(`Newman: ${name}`, process.execPath, args);
  if (!fs.existsSync(json)) throw new Error(`Newman did not produce ${json} (exit ${status})`);
  if (![0, 1].includes(status)) throw new Error(`Newman infrastructure failure for ${name}: exit ${status}`);
}

fixture("prepare-fr01-fixture.js");
run("fr01", [
  "FR-01 Registration - audited AI cases",
  "FR-01 Registration - student-selected extensions",
]);

fixture("prepare-fr11-fixture.js");
run("fr11", [
  "FR-11 Setup",
  "FR-11 Order History - audited AI cases",
  "FR-11 Order History - student-selected extensions",
]);

for (const [mode, folder] of [
  ["default", "FR-14 GET Categories - default fixture"],
  ["empty", "FR-14 GET Categories - empty fixture"],
  ["one", "FR-14 GET Categories - one fixture"],
  ["hundred", "FR-14 GET Categories - hundred fixture"],
  ["main", "FR-14 GET Categories - main audited cases"],
  ["large", "FR-14 GET Categories - large fixture"],
]) {
  fixture("prepare-fr14-get-fixture.js", mode);
  run(`fr14-get-${mode}`, [folder]);
}

fixture("prepare-fr14-post-fixture.js");
run("fr14-post", [
  "FR-14 POST Categories - audited AI cases",
  "FR-14 POST Categories - student-added cases",
]);

fixture("prepare-fr14-put-fixture.js");
run("fr14-put", [
  "FR-14 PUT Category - audited AI cases",
  "FR-14 PUT Category - student-added cases",
]);

fixture("prepare-fr14-delete-fixture.js", "single");
run("fr14-delete-single", ["FR-14 DELETE Category - single fixture"]);
fixture("prepare-fr14-delete-fixture.js", "main");
run("fr14-delete-main", [
  "FR-14 DELETE Category - main audited AI cases",
  "FR-14 DELETE Category - student-added cases",
]);

console.log(`\nFull suite produced 12 JSON and 12 HTML reports in ${output}`);
