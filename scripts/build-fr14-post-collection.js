const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const collectionPath = path.resolve(__dirname, "..", "postman", "eshop-hw06.postman_collection.json");
const collection = JSON.parse(fs.readFileSync(collectionPath, "utf8"));
const secret = "super_secret_key_that_should_not_be_here";
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
function signJwt(payload) {
  const unsigned = `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}`;
  const signature = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

const tokens = {
  admin: signJwt({ id: 1, role: "admin", exp: 4102444800 }),
  user: signJwt({ id: 2, role: "user", exp: 4102444800 }),
  expired: signJwt({ id: 1, role: "admin", exp: 1 }),
  forgedAdmin: signJwt({ id: 2, role: "admin", exp: 4102444800 }),
};
tokens.tampered = `${tokens.admin.slice(0, -1)}${tokens.admin.endsWith("A") ? "B" : "A"}`;

const studentHeader = { key: "X-Student-Id", value: "{{studentId}}", type: "text" };
const h = (key, value) => ({ key, value, type: "text" });
const urlObject = (raw) => ({ raw, host: ["{{baseUrl}}"], path: raw.replace(/^\{\{baseUrl\}\}\//, "").split("?")[0].split("/") });
const event = (listen, lines) => ({ listen, script: { type: "text/javascript", exec: lines } });

function postItem(id, name, rawBody, testLines, options = {}) {
  const headers = [studentHeader];
  if (options.auth !== null) headers.push(h("Authorization", options.auth === undefined ? `Bearer ${tokens.admin}` : options.auth));
  if (options.contentType !== null) headers.push(h("Content-Type", options.contentType || "application/json"));
  if (options.accept) headers.push(h("Accept", options.accept));
  if (options.extraHeaders) headers.push(...options.extraHeaders);
  const request = { method: "POST", header: headers, url: urlObject(`{{baseUrl}}${options.suffix || "/api/categories"}`) };
  if (rawBody !== undefined) request.body = { mode: "raw", raw: rawBody };
  return { name: `${id} ${name}`, request, event: [event("test", testLines)] };
}

function workflowItem(id, name, testLines) {
  return {
    name: `${id} ${name}`,
    request: { method: "GET", header: [studentHeader], url: urlObject("{{baseUrl}}/api/categories") },
    event: [event("test", testLines)],
  };
}

const json = (value) => JSON.stringify(value);
const status = (id, code) => [`pm.test('${id} - HTTP ${code}',()=>pm.expect(pm.response.code).to.eql(${code}));`];
const created = (id, expectedName) => [
  `pm.test('${id} - success response',()=>{pm.expect(pm.response.code).to.eql(200);const data=pm.response.json();pm.expect(Object.keys(data).sort()).to.eql(['id','message']);pm.expect(data.message).to.eql('Category created');pm.expect(Number.isInteger(data.id)).to.eql(true);pm.expect(data.id).to.be.above(0);});`,
  `if(pm.response.code===200){const id=pm.response.json().id;const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(err,res)=>pm.test('${id} - exact persisted value',()=>{pm.expect(err).to.eql(null);const row=res.json().find(x=>x.id===id);pm.expect(row).to.exist;pm.expect(row.name).to.eql(${JSON.stringify(expectedName)});}));}`,
];
const observation = (id) => [
  `console.log('${id} observed status/body:',pm.response.code,pm.response.text());`,
  `pm.test('${id} - unspecified length outcome recorded',()=>pm.expect(pm.response.code).to.be.a('number'));`,
];

const ai = [];
ai.push(postItem("FR14POST-AI-001", "ordinary admin create", json({ name: "FR14-AI-001-Ordinary" }), created("FR14POST-AI-001", "FR14-AI-001-Ordinary")));
ai.push(postItem("FR14POST-AI-002", "Vietnamese Unicode", json({ name: "Điện thoại thông minh" }), created("FR14POST-AI-002", "Điện thoại thông minh")));
ai.push(postItem("FR14POST-AI-003", "composed Vietnamese", json({ name: "Cà phê sữa đá" }), created("FR14POST-AI-003", "Cà phê sữa đá")));
ai.push(postItem("FR14POST-AI-004", "one visible character", json({ name: "Z" }), created("FR14POST-AI-004", "Z")));
ai.push(postItem("FR14POST-AI-005", "255-character observation", json({ name: "a".repeat(255) }), observation("FR14POST-AI-005")));
ai.push(postItem("FR14POST-AI-006", "256-character observation", json({ name: "b".repeat(256) }), observation("FR14POST-AI-006")));
ai.push(postItem("FR14POST-AI-007", "trim surrounding whitespace", json({ name: "  FR14-AI-007-Laptop  " }), created("FR14POST-AI-007", "FR14-AI-007-Laptop")));
ai.push(postItem("FR14POST-AI-008", "reject ASCII-space-only", json({ name: " " }), status("FR14POST-AI-008", 400)));
ai.push(postItem("FR14POST-AI-009", "reject control-whitespace-only", json({ name: "\t\n" }), status("FR14POST-AI-009", 400)));
ai.push(postItem("FR14POST-AI-010", "missing name", json({}), status("FR14POST-AI-010", 400)));
ai.push(postItem("FR14POST-AI-011", "empty name", json({ name: "" }), status("FR14POST-AI-011", 400)));
ai.push(postItem("FR14POST-AI-012", "null name", json({ name: null }), status("FR14POST-AI-012", 400)));
ai.push(postItem("FR14POST-AI-013", "numeric name", json({ name: 14 }), status("FR14POST-AI-013", 400)));
ai.push(postItem("FR14POST-AI-014", "boolean name", json({ name: true }), status("FR14POST-AI-014", 400)));
ai.push(postItem("FR14POST-AI-015", "object name", json({ name: { value: "x" } }), status("FR14POST-AI-015", 400)));
ai.push(postItem("FR14POST-AI-016", "array name", json({ name: ["x"] }), status("FR14POST-AI-016", 400)));
ai.push(postItem("FR14POST-AI-017", "missing request body", undefined, status("FR14POST-AI-017", 400)));
ai.push(postItem("FR14POST-AI-018", "malformed JSON", "{\"name\":", [
  ...status("FR14POST-AI-018", 400),
  "pm.test('FR14POST-AI-018 - no stack/internal path',()=>{const body=pm.response.text().toLowerCase();pm.expect(body).not.to.include('node_modules');pm.expect(body).not.to.include('syntaxerror');});",
]));
ai.push(postItem("FR14POST-AI-019", "text/plain JSON", json({ name: "FR14-AI-019" }), status("FR14POST-AI-019", 415), { contentType: "text/plain" }));
ai.push(postItem("FR14POST-AI-020", "form-encoded body", "name=FR14-AI-020", status("FR14POST-AI-020", 415), { contentType: "application/x-www-form-urlencoded" }));
ai.push(postItem("FR14POST-AI-021", "missing Authorization", json({ name: "FR14-AI-021" }), status("FR14POST-AI-021", 401), { auth: null }));
ai.push(postItem("FR14POST-AI-022", "empty Authorization", json({ name: "FR14-AI-022" }), status("FR14POST-AI-022", 401), { auth: "" }));
ai.push(postItem("FR14POST-AI-023", "Bearer without credential", json({ name: "FR14-AI-023" }), status("FR14POST-AI-023", 401), { auth: "Bearer" }));
ai.push(postItem("FR14POST-AI-024", "malformed token", json({ name: "FR14-AI-024" }), status("FR14POST-AI-024", 403), { auth: "Bearer malformed" }));
ai.push(postItem("FR14POST-AI-025", "expired token", json({ name: "FR14-AI-025" }), status("FR14POST-AI-025", 403), { auth: `Bearer ${tokens.expired}` }));
ai.push(postItem("FR14POST-AI-026", "tampered token", json({ name: "FR14-AI-026" }), status("FR14POST-AI-026", 403), { auth: `Bearer ${tokens.tampered}` }));
ai.push(postItem("FR14POST-AI-027", "normal user forbidden", json({ name: "FR14-AI-027" }), status("FR14POST-AI-027", 403), { auth: `Bearer ${tokens.user}` }));
ai.push(postItem("FR14POST-AI-028", "valid admin", json({ name: "FR14-AI-028" }), created("FR14POST-AI-028", "FR14-AI-028")));
ai.push(postItem("FR14POST-AI-029", "role query cannot elevate", json({ name: "FR14-AI-029" }), status("FR14POST-AI-029", 403), { auth: `Bearer ${tokens.user}`, suffix: "/api/categories?role=admin" }));
ai.push(postItem("FR14POST-AI-030", "role header cannot elevate", json({ name: "FR14-AI-030" }), status("FR14POST-AI-030", 403), { auth: `Bearer ${tokens.user}`, extraHeaders: [h("X-Role", "admin")] }));
ai.push(postItem("FR14POST-AI-031", "reject extra fields", json({ name: "FR14-AI-031", id: 999, role: "admin", created_at: "2026-01-01" }), status("FR14POST-AI-031", 400)));

function duplicateWorkflow(id, first, second, expectedNames) {
  return workflowItem(id, "allowed duplicate workflow", [
    `const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');const auth='Bearer ${tokens.admin}';const headers={'X-Student-Id':sid,Authorization:auth,'Content-Type':'application/json'};const first=${JSON.stringify(first)};const second=${JSON.stringify(second)};`,
    `pm.sendRequest({url:base+'/api/categories',method:'POST',header:headers,body:{mode:'raw',raw:JSON.stringify({name:first})}},(e1,r1)=>pm.sendRequest({url:base+'/api/categories',method:'POST',header:headers,body:{mode:'raw',raw:JSON.stringify({name:second})}},(e2,r2)=>pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(e3,r3)=>pm.test('${id} - both duplicates persisted with distinct IDs',()=>{pm.expect(e1).to.eql(null);pm.expect(e2).to.eql(null);pm.expect(e3).to.eql(null);pm.expect(r1.code).to.eql(200);pm.expect(r2.code).to.eql(200);pm.expect(r1.json().id).not.to.eql(r2.json().id);const names=r3.json().map(x=>x.name);${first === second ? `pm.expect(names.filter(n=>n===${JSON.stringify(first)}).length).to.be.at.least(2);` : expectedNames.map((x) => `pm.expect(names.filter(n=>n===${JSON.stringify(x)}).length).to.be.at.least(1);`).join("")}}))));`,
  ]);
}
ai.push(duplicateWorkflow("FR14POST-AI-032", "FR14-AI-032-DUP", "FR14-AI-032-DUP", ["FR14-AI-032-DUP"]));
ai.push(duplicateWorkflow("FR14POST-AI-033", "FR14-AI-033-Case", "fr14-ai-033-case", ["FR14-AI-033-Case", "fr14-ai-033-case"]));
ai.push(duplicateWorkflow("FR14POST-AI-034", "FR14-AI-034-Café", "FR14-AI-034-Café", ["FR14-AI-034-Café", "FR14-AI-034-Café"]));
ai.push(postItem("FR14POST-AI-035", "stored XSS is inert", json({ name: "<script>alert(1)</script>" }), created("FR14POST-AI-035", "<script>alert(1)</script>")));
ai.push(postItem("FR14POST-AI-036", "SQL injection remains literal", json({ name: "x'); DROP TABLE categories;--" }), created("FR14POST-AI-036", "x'); DROP TABLE categories;--")));
ai.push(postItem("FR14POST-AI-037", "strict success contract", json({ name: "FR14-AI-037" }), created("FR14POST-AI-037", "FR14-AI-037")));

function concurrentWorkflow(id, names, expectedCodes) {
  return workflowItem(id, "concurrent create workflow", [
    `const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');const auth='Bearer ${tokens.admin}';const names=${JSON.stringify(names)};const expected=${JSON.stringify(expectedCodes)};const headers={'X-Student-Id':sid,Authorization:auth,'Content-Type':'application/json'};let done=0;const results=[];`,
    `names.forEach((name,index)=>pm.sendRequest({url:base+'/api/categories',method:'POST',header:headers,body:{mode:'raw',raw:JSON.stringify({name})}},(err,res)=>{results[index]={err,code:err?0:res.code,id:!err&&res.code===200?res.json().id:null};done++;if(done===names.length)pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(getErr,getRes)=>pm.test('${id} - concurrent outcomes and final state',()=>{pm.expect(getErr).to.eql(null);pm.expect(results.map(x=>x.code)).to.eql(expected);const ids=results.filter(x=>x.id).map(x=>x.id);pm.expect(new Set(ids).size).to.eql(ids.length);const rows=getRes.json();names.forEach((name,i)=>{if(expected[i]===200)pm.expect(rows.filter(x=>x.name===name).length).to.be.at.least(1);});}));}));`,
  ]);
}
ai.push(concurrentWorkflow("FR14POST-AI-038", Array.from({ length: 10 }, (_, i) => `FR14-AI-038-${i}`), Array(10).fill(200)));
ai.push(concurrentWorkflow("FR14POST-AI-039", Array(10).fill("FR14-AI-039-DUP"), Array(10).fill(200)));
ai.push(postItem("FR14POST-AI-040", "reject HTML Accept", json({ name: "FR14-AI-040" }), status("FR14POST-AI-040", 406), { accept: "text/html" }));

const human = [];
human.push(postItem("FR14POST-H-001", "forged admin token", json({ name: "FR14-H-001" }), status("FR14POST-H-001", 403), { auth: `Bearer ${tokens.forgedAdmin}` }));
human.push(postItem("FR14POST-H-002", "role claim disagrees with account", json({ name: "FR14-H-002" }), status("FR14POST-H-002", 403), { auth: `Bearer ${tokens.forgedAdmin}` }));
human.push(postItem("FR14POST-H-003", "duplicate JSON name keys", "{\"name\":\"Safe\",\"name\":\"   \"}", status("FR14POST-H-003", 400)));
human.push(postItem("FR14POST-H-004", "prototype-shaped extra field", "{\"name\":\"FR14-H-004\",\"__proto__\":{\"role\":\"admin\"}}", status("FR14POST-H-004", 400)));
human.push(postItem("FR14POST-H-005", "wrong JSON root type", json("Laptop"), status("FR14POST-H-005", 400)));
human.push(duplicateWorkflow("FR14POST-H-006", "FR14-H-006-REPLAY", "FR14-H-006-REPLAY", ["FR14-H-006-REPLAY"]));
human.push(concurrentWorkflow("FR14POST-H-007", ["FR14-H-007-VALID", "   "], [200, 400]));

if (ai.length !== 40 || human.length !== 7) throw new Error(`Unexpected POST case count: ${ai.length} AI, ${human.length} human`);
collection.item = collection.item.filter((folder) => !folder.name.startsWith("FR-14 POST"));
collection.item.push(
  { name: "FR-14 POST Categories - audited AI cases", item: ai },
  { name: "FR-14 POST Categories - student-added cases", item: human },
);
fs.writeFileSync(collectionPath, `${JSON.stringify(collection, null, 2)}\n`, "utf8");
console.log(`Updated ${collectionPath}`);
console.log(`FR-14 POST case count: ${ai.length + human.length}`);
