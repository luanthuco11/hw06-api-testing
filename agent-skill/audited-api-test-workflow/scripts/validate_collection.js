#!/usr/bin/env node
const fs = require("fs");

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate_collection.js <collection.json> [minimum-ai] [minimum-human]");
  process.exit(2);
}
const minimumAi = Number(process.argv[3] || 0);
const minimumHuman = Number(process.argv[4] || 0);
const collection = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const ids = [];
const counts = new Map();

const variables = new Map((collection.variable || []).map((entry) => [entry.key, String(entry.value)]));
if (!variables.has("studentId") || !/^\d+$/.test(variables.get("studentId"))) {
  errors.push("collection variable studentId is missing or nonnumeric");
}
const preRequestText = (collection.event || [])
  .filter((entry) => entry.listen === "prerequest")
  .flatMap((entry) => entry.script?.exec || [])
  .join("\n");
if (!preRequestText.includes("X-Student-Id")) errors.push("collection pre-request script does not insert X-Student-Id");
if (!preRequestText.includes("console.log")) errors.push("collection pre-request script does not log attribution");

function walk(nodes, folder = "root") {
  for (const node of nodes || []) {
    if (node.item) {
      walk(node.item, node.name);
      continue;
    }
    const id = String(node.name || "").split(" ")[0];
    if (!id) errors.push(`unnamed request in ${folder}`);
    ids.push(id);
    const family = id.replace(/-(AI|H)-\d+$/, "");
    const kind = id.includes("-AI-") ? "ai" : id.includes("-H-") ? "human" : "other";
    const key = `${family}:${kind}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
}
walk(collection.item);

for (const id of new Set(ids)) {
  if (ids.filter((candidate) => candidate === id).length > 1 && id !== "Setup") errors.push(`duplicate case ID: ${id}`);
}
const families = new Set([...counts.keys()].map((key) => key.split(":")[0]));
for (const family of families) {
  const ai = counts.get(`${family}:ai`) || 0;
  const human = counts.get(`${family}:human`) || 0;
  if (minimumAi && ai && ai < minimumAi) errors.push(`${family} has ${ai} AI cases; minimum is ${minimumAi}`);
  if (minimumHuman && ai && human < minimumHuman) errors.push(`${family} has ${human} human cases; minimum is ${minimumHuman}`);
}

console.log(`Collection: ${collection.info?.name || "<unnamed>"}`);
console.log(`Student ID: ${variables.get("studentId") || "<missing>"}`);
for (const family of [...families].sort()) {
  console.log(`${family}: AI=${counts.get(`${family}:ai`) || 0}, human=${counts.get(`${family}:human`) || 0}`);
}
if (errors.length) {
  errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exit(1);
}
console.log("Collection validation passed.");
