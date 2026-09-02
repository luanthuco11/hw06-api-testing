const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const collectionPath = path.resolve(__dirname, "..", "postman", "eshop-hw06.postman_collection.json");
const collection = JSON.parse(fs.readFileSync(collectionPath, "utf8"));
const studentHeader = { key: "X-Student-Id", value: "{{studentId}}", type: "text" };

const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
function signJwt(payload) {
  const unsigned = `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}`;
  const signature = crypto.createHmac("sha256", "super_secret_key_that_should_not_be_here").update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}
const validUserToken = signJwt({ id: 2, role: "user", exp: 4102444800 });
const validAdminToken = signJwt({ id: 1, role: "admin", exp: 4102444800 });

const urlObject = (raw) => ({ raw, host: ["{{baseUrl}}"], path: raw.replace(/^\{\{baseUrl\}\}\//, "").split("?")[0].split("/") });
const events = (lines) => [{ listen: "test", script: { type: "text/javascript", exec: lines } }];
const header = (key, value) => ({ key, value, type: "text" });

function item(id, name, lines, options = {}) {
  const headers = [studentHeader, ...(options.headers || [])];
  return {
    name: `${id} ${name}`,
    request: {
      method: options.method || "GET",
      header: headers,
      url: urlObject(`{{baseUrl}}${options.suffix || "/api/categories"}`),
    },
    event: events(lines),
  };
}

const strictSchema = [
  "function assertStrictCategory(row) {",
  "  pm.expect(Object.keys(row).sort()).to.eql(['id','name']);",
  "  pm.expect(row.id).to.be.a('number');",
  "  pm.expect(Number.isInteger(row.id)).to.eql(true);",
  "  pm.expect(row.id).to.be.above(0);",
  "}",
];
const normalList = [
  "pm.expect(pm.response.code).to.eql(200);",
  "pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');",
  "pm.expect(pm.response.json()).to.be.an('array');",
];
const sameSetScript = (testName) => [
  "const original=pm.response.json();",
  "const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');",
  `pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(err,res)=>pm.test('${testName}',()=>{pm.expect(err).to.eql(null);pm.expect(res.code).to.eql(200);pm.expect(res.json()).to.eql(original);}));`,
];

const defaultItems = [
  item("FR14GET-AI-001", "fresh three-category seed", [
    "pm.test('FR14GET-AI-001 - exact fresh seed',()=>{const rows=pm.response.json();pm.expect(pm.response.code).to.eql(200);pm.expect(rows).to.have.length(3);pm.expect(rows.map(x=>x.name)).to.eql(['Điện thoại','Laptop','Phụ kiện']);});",
  ]),
];

const emptyItems = [
  item("FR14GET-AI-002", "empty category state", ["pm.test('FR14GET-AI-002 - empty array',()=>{pm.expect(pm.response.code).to.eql(200);pm.expect(pm.response.json()).to.eql([]);});"]),
];

const oneItems = [
  item("FR14GET-AI-003", "one category", [...strictSchema, "pm.test('FR14GET-AI-003 - one category',()=>{const rows=pm.response.json();pm.expect(rows).to.have.length(1);assertStrictCategory(rows[0]);pm.expect(rows[0].name).to.eql('FR14-ONE-SENTINEL');});"]),
];

const hundredItems = [
  item("FR14GET-AI-004", "one hundred categories", ["pm.test('FR14GET-AI-004 - no truncation',()=>{const rows=pm.response.json();pm.expect(pm.response.code).to.eql(200);pm.expect(rows).to.have.length(100);pm.expect(new Set(rows.map(x=>x.id)).size).to.eql(100);});"]),
];

const main = [];
main.push(item("FR14GET-AI-005", "strict item schema", [...strictSchema, "pm.test('FR14GET-AI-005 - exact keys',()=>pm.response.json().forEach(assertStrictCategory));"]));
main.push(item("FR14GET-AI-006", "positive integer IDs", ["pm.test('FR14GET-AI-006 - ID type and range',()=>pm.response.json().forEach(x=>{pm.expect(Number.isInteger(x.id)).to.eql(true);pm.expect(x.id).to.be.above(0);}));"]));
main.push(item("FR14GET-AI-007", "valid name type", ["pm.test('FR14GET-AI-007 - valid sentinel is non-empty string',()=>{const row=pm.response.json().find(x=>x.name==='FR14-VALID-SENTINEL');pm.expect(row.name).to.be.a('string').and.not.empty;});"]));
main.push(item("FR14GET-AI-008", "Vietnamese Unicode", ["pm.test('FR14GET-AI-008 - Unicode preserved',()=>pm.expect(pm.response.json().some(x=>x.name==='Điện thoại')).to.eql(true));"]));
main.push(item("FR14GET-AI-009", "composed accents", ["pm.test('FR14GET-AI-009 - composed text preserved',()=>pm.expect(pm.response.json().some(x=>x.name==='Cà phê sữa đá')).to.eql(true));"]));
main.push(item("FR14GET-AI-010", "one-character name", ["pm.test('FR14GET-AI-010 - one character complete',()=>pm.expect(pm.response.json().some(x=>x.name==='Z')).to.eql(true));"]));
main.push(item("FR14GET-AI-011", "255-character name", ["pm.test('FR14GET-AI-011 - 255 chars complete',()=>pm.expect(pm.response.json().some(x=>typeof x.name==='string'&&x.name.length===255&&/^a+$/.test(x.name))).to.eql(true));"]));
main.push(item("FR14GET-AI-012", "256-character name", ["pm.test('FR14GET-AI-012 - 256 chars complete',()=>pm.expect(pm.response.json().some(x=>typeof x.name==='string'&&x.name.length===256&&/^b+$/.test(x.name))).to.eql(true));"]));
main.push(item("FR14GET-AI-013", "duplicate stored names", ["pm.test('FR14GET-AI-013 - duplicate rows not merged',()=>{const rows=pm.response.json().filter(x=>x.name==='FR14-DUPLICATE');pm.expect(rows).to.have.length(2);pm.expect(rows[0].id).not.to.eql(rows[1].id);});"]));
main.push(item("FR14GET-AI-014", "empty corrupt stored name observation", ["console.log('FR14GET-AI-014 empty stored name observation:',pm.response.json().some(x=>x.name===''));", "pm.test('FR14GET-AI-014 - response does not crash',()=>pm.expect(pm.response.code).to.eql(200));"]));
main.push(item("FR14GET-AI-015", "null corrupt stored name observation", ["console.log('FR14GET-AI-015 null stored name observation:',pm.response.json().some(x=>x.name===null));", "pm.test('FR14GET-AI-015 - response does not crash',()=>pm.expect(pm.response.code).to.eql(200));"]));
main.push(item("FR14GET-AI-016", "stored XSS remains inert JSON", ["pm.test('FR14GET-AI-016 - XSS is body data',()=>{pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');pm.expect(pm.response.json().some(x=>x.name==='<script>alert(1)</script>')).to.eql(true);});"]));
main.push(item("FR14GET-AI-017", "stored SQL-like name", ["pm.test('FR14GET-AI-017 - literal SQL-like value only',()=>{const rows=pm.response.json();pm.expect(rows.filter(x=>x.name===\"x' OR 1=1 --\")).to.have.length(1);pm.expect(pm.response.text().toLowerCase()).not.to.include('sqlite_error');});"]));
main.push(item("FR14GET-AI-018", "status code", ["pm.test('FR14GET-AI-018 - HTTP 200',()=>pm.expect(pm.response.code).to.eql(200));"]));
main.push(item("FR14GET-AI-019", "JSON media type", ["pm.test('FR14GET-AI-019 - application/json',()=>pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json')); "]));
main.push(item("FR14GET-AI-020", "JSON array parsing", ["pm.test('FR14GET-AI-020 - parseable array',()=>pm.expect(pm.response.json()).to.be.an('array')); "]));
main.push(item("FR14GET-AI-021", "data minimization", ["pm.test('FR14GET-AI-021 - no unrelated fields',()=>pm.response.json().forEach(x=>['password','token','role','user','products','category_id'].forEach(k=>pm.expect(x).not.to.have.property(k))));"]));
main.push(item("FR14GET-AI-022", "public without Authorization", ["pm.test('FR14GET-AI-022 - public read',()=>{pm.expect(pm.response.code).to.eql(200);pm.expect(pm.response.json()).to.be.an('array');});"]));
main.push(item("FR14GET-AI-023", "invalid token does not alter public read", [...sameSetScript("FR14GET-AI-023 - same public result"),], { headers: [header("Authorization", "Bearer invalid.token.value")] }));
main.push(item("FR14GET-AI-024", "normal-user token same public read", [...sameSetScript("FR14GET-AI-024 - same category set")], { headers: [header("Authorization", `Bearer ${validUserToken}`)] }));
main.push(item("FR14GET-AI-025", "admin token same public read", [...sameSetScript("FR14GET-AI-025 - same category set")], { headers: [header("Authorization", `Bearer ${validAdminToken}`)] }));
for (const [number, suffix, label] of [
  [26, "/api/categories?search=phone", "search ignored"],
  [27, "/api/categories?page=1&limit=1", "pagination ignored"],
  [28, "/api/categories?sort=name&order=desc", "sort ignored"],
  [29, "/api/categories?user_id=1&role=admin", "access query ignored"],
  [30, "/api/categories?q=%27%20OR%201%3D1%20--", "injection query inert"],
]) {
  const id = `FR14GET-AI-${String(number).padStart(3, "0")}`;
  main.push(item(id, label, ["const queried=pm.response.json();", "const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');", `pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(err,res)=>pm.test('${id} - complete list unchanged',()=>{pm.expect(err).to.eql(null);pm.expect(pm.response.code).to.eql(200);pm.expect(queried).to.eql(res.json());}));`], { suffix }));
}
main.push(item("FR14GET-AI-031", "repeatable GET", sameSetScript("FR14GET-AI-031 - equivalent repeated response")));
main.push(item("FR14GET-AI-032", "ten concurrent reads", [
  "const expected=pm.response.text();let done=0;let consistent=true;const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');",
  "for(let i=0;i<10;i++)pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(err,res)=>{done++;consistent=consistent&&!err&&res.code===200&&res.text()===expected;if(done===10)pm.test('FR14GET-AI-032 - concurrent reads equivalent',()=>pm.expect(consistent).to.eql(true));});",
]));
main.push(item("FR14GET-AI-033", "unsupported PATCH", ["pm.test('FR14GET-AI-033 - route not found',()=>pm.expect(pm.response.code).to.eql(404));"], { method: "PATCH" }));
main.push(item("FR14GET-AI-034", "CORS preflight", ["pm.test('FR14GET-AI-034 - controlled GET preflight',()=>{pm.expect(pm.response.code).to.be.oneOf([200,204]);pm.expect(pm.response.headers.get('Access-Control-Allow-Origin')).to.exist;pm.expect((pm.response.headers.get('Access-Control-Allow-Methods')||'')).to.include('GET');pm.expect((pm.response.headers.get('Access-Control-Allow-Credentials')||'').toLowerCase()).not.to.eql('true');});"], { method: "OPTIONS", headers: [header("Origin", "https://student.example"), header("Access-Control-Request-Method", "GET")] }));
main.push(item("FR14GET-AI-035", "Accept application/json", ["pm.test('FR14GET-AI-035 - JSON accepted',()=>{pm.expect(pm.response.code).to.eql(200);pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');pm.expect(pm.response.json()).to.be.an('array');});"], { headers: [header("Accept", "application/json")] }));
main.push(item("FR14GET-AI-036", "reject unacceptable HTML", ["pm.test('FR14GET-AI-036 - student-approved 406',()=>pm.expect(pm.response.code).to.eql(406));", "pm.test('FR14GET-AI-036 - never HTML',()=>pm.expect((pm.response.headers.get('Content-Type')||'').toLowerCase()).not.to.include('text/html'));"], { headers: [header("Accept", "text/html")] }));
main.push(item("FR14GET-AI-037", "conditional request observation", [
  "const etag=pm.response.headers.get('ETag');console.log('FR14GET-AI-037 ETag:',etag||'<absent>');",
  "if(etag){const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid,'If-None-Match':etag}},(err,res)=>pm.test('FR14GET-AI-037 - ETag observation is valid HTTP',()=>{pm.expect(err).to.eql(null);pm.expect(res.code).to.be.oneOf([200,304]);}));}else{pm.test('FR14GET-AI-037 - no ETag is allowed',()=>pm.expect(pm.response.code).to.eql(200));}",
]));
main.push(item("FR14GET-AI-038", "cache policy observation", ["console.log('FR14GET-AI-038 Cache-Control:',pm.response.headers.get('Cache-Control')||'<absent>');", "pm.test('FR14GET-AI-038 - observable response',()=>pm.expect(pm.response.code).to.eql(200));"]));
main.push(item("FR14GET-AI-039", "local response-time observation", ["console.log('FR14GET-AI-039 response time ms:',pm.response.responseTime);", "pm.test('FR14GET-AI-039 - response time measured',()=>pm.expect(pm.response.responseTime).to.be.a('number')); "]));
main.push(item("FR14GET-AI-040", "GET does not mutate", sameSetScript("FR14GET-AI-040 - before and after identical")));

main.push(item("FR14GET-H-001", "duplicate query parameters", ["const rows=pm.response.json();const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(err,res)=>pm.test('FR14GET-H-001 - duplicate params ignored',()=>{pm.expect(err).to.eql(null);pm.expect(pm.response.code).to.eql(200);pm.expect(rows).to.eql(res.json());}));"], { suffix: "/api/categories?limit=1&limit=0&limit=999" }));
main.push(item("FR14GET-H-002", "nested and array query parameters", ["const rows=pm.response.json();const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(err,res)=>pm.test('FR14GET-H-002 - shaped params ignored',()=>{pm.expect(err).to.eql(null);pm.expect(pm.response.code).to.eql(200);pm.expect(rows).to.eql(res.json());rows.forEach(x=>pm.expect(Object.keys(x).sort()).to.eql(['id','name']));}));"], { suffix: "/api/categories?filter%5Bname%5D=x&fields%5B%5D=id&fields%5B%5D=secret" }));
main.push(item("FR14GET-H-003", "method override cannot mutate", ["const original=pm.response.json();const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid,'X-HTTP-Method-Override':'DELETE','X-Method-Override':'DELETE'}},(err,res)=>pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(err2,res2)=>pm.test('FR14GET-H-003 - remains GET and state unchanged',()=>{pm.expect(err).to.eql(null);pm.expect(res.code).to.eql(200);pm.expect(err2).to.eql(null);pm.expect(res2.json()).to.eql(original);})));"]));
main.push(item("FR14GET-H-004", "stored CRLF cannot inject header", ["pm.test('FR14GET-H-004 - control data stays in JSON body',()=>{const rows=pm.response.json();pm.expect(rows.some(x=>x.name==='safe\\r\\nX-HW06-Injected: yes\\t\"\\\\')).to.eql(true);pm.expect(pm.response.headers.has('X-HW06-Injected')).to.eql(false);pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');});"]));
main.push(item("FR14GET-H-005", "atomic snapshots across create/delete", [
  "const initial=pm.response.json();const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');const auth='Bearer '+" + JSON.stringify(validAdminToken) + ";const name='FR14-H005-'+Date.now();const headers={'X-Student-Id':sid,'Authorization':auth,'Content-Type':'application/json'};",
  "pm.sendRequest({url:base+'/api/categories',method:'POST',header:headers,body:{mode:'raw',raw:JSON.stringify({name})}},(createErr,createRes)=>{const id=createRes.json().id;pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(readErr,readRes)=>{pm.sendRequest({url:base+'/api/categories/'+id,method:'DELETE',header:headers},(deleteErr,deleteRes)=>{pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(finalErr,finalRes)=>pm.test('FR14GET-H-005 - valid transition snapshots and restoration',()=>{pm.expect(createErr).to.eql(null);pm.expect(createRes.code).to.eql(200);pm.expect(readErr).to.eql(null);pm.expect(readRes.code).to.eql(200);pm.expect(readRes.json().some(x=>x.id===id&&x.name===name)).to.eql(true);pm.expect(deleteErr).to.eql(null);pm.expect(deleteRes.code).to.eql(200);pm.expect(finalErr).to.eql(null);pm.expect(finalRes.json()).to.eql(initial);}));});});});",
]));

const largeItems = [
  item("FR14GET-H-006", "ten-thousand-row sentinel integrity", [...strictSchema,
    "console.log('FR14GET-H-006 response time ms:',pm.response.responseTime);",
    "pm.test('FR14GET-H-006 - complete unique large list',()=>{const rows=pm.response.json();pm.expect(pm.response.code).to.eql(200);pm.expect(rows).to.have.length(10000);pm.expect(new Set(rows.map(x=>x.id)).size).to.eql(10000);rows.forEach(assertStrictCategory);});",
    "pm.test('FR14GET-H-006 - all sentinels present',()=>{const names=new Set(pm.response.json().map(x=>x.name));['FR14-LARGE-FIRST-SENTINEL','FR14-LARGE-MIDDLE-SENTINEL','FR14-LARGE-LAST-SENTINEL'].forEach(x=>pm.expect(names.has(x)).to.eql(true));});",
  ]),
];

collection.item = collection.item.filter((folder) => !folder.name.startsWith("FR-14 GET"));
collection.item.push(
  { name: "FR-14 GET Categories - default fixture", item: defaultItems },
  { name: "FR-14 GET Categories - empty fixture", item: emptyItems },
  { name: "FR-14 GET Categories - one fixture", item: oneItems },
  { name: "FR-14 GET Categories - hundred fixture", item: hundredItems },
  { name: "FR-14 GET Categories - main audited cases", item: main },
  { name: "FR-14 GET Categories - large fixture", item: largeItems },
);

fs.writeFileSync(collectionPath, `${JSON.stringify(collection, null, 2)}\n`, "utf8");
console.log(`Updated ${collectionPath}`);
console.log(`FR-14 GET case count: ${defaultItems.length + emptyItems.length + oneItems.length + hundredItems.length + main.length + largeItems.length}`);
