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
  expired: signJwt({ id: 2, role: "user", exp: 1 }),
  deleted: signJwt({ id: 9999, role: "user", exp: 4102444800 }),
  missingId: signJwt({ role: "user", exp: 4102444800 }),
  stringId: signJwt({ id: "2", role: "user", exp: 4102444800 }),
  nullId: signJwt({ id: null, role: "user", exp: 4102444800 }),
  negativeId: signJwt({ id: -1, role: "user", exp: 4102444800 }),
  sqlId: signJwt({ id: "' OR 1=1 --", role: "user", exp: 4102444800 }),
  forgedUserB: signJwt({ id: 3, role: "user", exp: 4102444800 }),
};
tokens.tampered = `${tokens.deleted.slice(0, -1)}${tokens.deleted.endsWith("A") ? "B" : "A"}`;
tokens.none = `${b64({ alg: "none", typ: "JWT" })}.${b64({ id: 2, role: "admin" })}.`;

const studentHeader = { key: "X-Student-Id", value: "{{studentId}}", type: "text" };
const authHeader = (value) => ({ key: "Authorization", value, type: "text" });
const urlObject = (raw) => ({ raw, host: ["{{baseUrl}}"], path: raw.replace(/^\{\{baseUrl\}\}\//, "").split("/") });
const testEvent = (lines) => [{ listen: "test", script: { type: "text/javascript", exec: lines } }];

function getItem(id, name, tokenValue, lines, suffix = "/api/orders/my-orders") {
  const headers = [studentHeader];
  if (tokenValue !== null) headers.push(authHeader(tokenValue));
  return {
    name: `${id} ${name}`,
    request: { method: "GET", header: headers, url: urlObject(`{{baseUrl}}${suffix}`) },
    event: testEvent(lines),
  };
}

const strictSchema = [
  "const strictKeys = ['created_at', 'id', 'status', 'total_amount'];",
  "function assertStrictOrder(order) {",
  "  pm.expect(Object.keys(order).sort()).to.eql(strictKeys);",
  "  pm.expect(order.id).to.be.a('number').and.above(0);",
  "  pm.expect(order.total_amount).to.be.a('number');",
  "  pm.expect(order.status).to.be.oneOf(['pending','confirmed','shipping','delivered','canceled']);",
  "  pm.expect(new Date(order.created_at).toString()).not.to.eql('Invalid Date');",
  "}",
];

const loginDefinitions = [
  ["testToken", "test@eshop.com", "Test1234!"],
  ["adminToken", "admin@eshop.com", "Admin123!"],
  ["oneToken", "fr11-one@hw06.test", "Pass123!"],
  ["emptyToken", "fr11-empty@hw06.test", "Pass123!"],
  ["threeToken", "fr11-three@hw06.test", "Pass123!"],
  ["largeToken", "fr11-large-a@hw06.test", "Pass123!"],
  ["raceToken", "fr11-race@hw06.test", "Pass123!"],
];
const setupItems = loginDefinitions.map(([variable, email, password]) => ({
  name: `Setup token ${variable}`,
  request: {
    method: "POST",
    header: [studentHeader, { key: "Content-Type", value: "application/json", type: "text" }],
    body: { mode: "raw", raw: JSON.stringify({ email, password }) },
    url: urlObject("{{baseUrl}}/api/login"),
  },
  event: testEvent([
    "if (pm.response.code !== 200) throw new Error('Fixture login failed');",
    `pm.collectionVariables.set('${variable}', pm.response.json().token);`,
  ]),
}));

const ai = [];
ai.push(getItem("FR11-AI-001", "empty history", "Bearer {{emptyToken}}", ["pm.test('FR11-AI-001 - empty array', () => { pm.expect(pm.response.code).to.eql(200); pm.expect(pm.response.json()).to.eql([]); });"]));
ai.push(getItem("FR11-AI-002", "single order", "Bearer {{oneToken}}", [...strictSchema, "pm.test('FR11-AI-002 - one own order', () => { const rows=pm.response.json(); pm.expect(pm.response.code).to.eql(200); pm.expect(rows).to.have.length(1); assertStrictOrder(rows[0]); });"]));
ai.push(getItem("FR11-AI-003", "three orders", "Bearer {{threeToken}}", ["pm.test('FR11-AI-003 - three own orders', () => { pm.expect(pm.response.code).to.eql(200); pm.expect(pm.response.json()).to.have.length(3); });"]));
ai.push(getItem("FR11-AI-004", "newest first", "Bearer {{threeToken}}", ["pm.test('FR11-AI-004 - descending IDs', () => { const ids=pm.response.json().map(x=>x.id); pm.expect(ids).to.eql([...ids].sort((a,b)=>b-a)); });"]));
ai.push(getItem("FR11-AI-005", "strict response schema", "Bearer {{oneToken}}", [...strictSchema, "pm.test('FR11-AI-005 - exact keys', () => pm.response.json().forEach(assertStrictOrder));"]));
ai.push(getItem("FR11-AI-006", "schema types", "Bearer {{oneToken}}", [...strictSchema, "pm.test('FR11-AI-006 - exact types', () => pm.response.json().forEach(assertStrictOrder));"]));
for (const [number, status] of [[7,"pending"],[8,"confirmed"],[9,"shipping"],[10,"delivered"],[11,"canceled"]]) {
  const id = `FR11-AI-${String(number).padStart(3,"0")}`;
  ai.push(getItem(id, `${status} status`, "Bearer {{testToken}}", [`pm.test('${id} - status represented', () => pm.expect(pm.response.json().some(x=>x.status==='${status}')).to.eql(true));`]));
}
ai.push(getItem("FR11-AI-012", "zero total observation", "Bearer {{testToken}}", ["pm.test('FR11-AI-012 - zero total is faithfully returned', () => pm.expect(pm.response.json().some(x=>x.total_amount===0)).to.eql(true));"]));
ai.push(getItem("FR11-AI-013", "smallest positive total", "Bearer {{testToken}}", ["pm.test('FR11-AI-013 - total 1 returned as number', () => pm.expect(pm.response.json().some(x=>x.total_amount===1)).to.eql(true));"]));
ai.push(getItem("FR11-AI-014", "large safe integer total", "Bearer {{testToken}}", ["pm.test('FR11-AI-014 - safe integer preserved', () => pm.expect(pm.response.json().some(x=>x.total_amount===Number.MAX_SAFE_INTEGER)).to.eql(true));"]));
ai.push(getItem("FR11-AI-015", "Vietnamese address minimized", "Bearer {{oneToken}}", ["pm.test('FR11-AI-015 - shipping address omitted', () => pm.response.json().forEach(x=>pm.expect(x).not.to.have.property('shipping_address')));"]));
ai.push(getItem("FR11-AI-016", "missing authorization", null, ["pm.test('FR11-AI-016 - 401', () => pm.expect(pm.response.code).to.eql(401));"]));
ai.push(getItem("FR11-AI-017", "empty authorization", "", ["pm.test('FR11-AI-017 - 401', () => pm.expect(pm.response.code).to.eql(401));"]));
ai.push(getItem("FR11-AI-018", "Bearer without token", "Bearer", ["pm.test('FR11-AI-018 - 401', () => pm.expect(pm.response.code).to.eql(401));"]));
ai.push(getItem("FR11-AI-019", "blank Bearer credential", "Bearer ", ["pm.test('FR11-AI-019 - 401', () => pm.expect(pm.response.code).to.eql(401));"]));
ai.push(getItem("FR11-AI-020", "invalid three-segment JWT", "Bearer aaa.bbb.ccc", ["pm.test('FR11-AI-020 - 403', () => pm.expect(pm.response.code).to.eql(403));"]));
ai.push(getItem("FR11-AI-021", "malformed token", "Bearer malformed", ["pm.test('FR11-AI-021 - 403', () => pm.expect(pm.response.code).to.eql(403));"]));
ai.push(getItem("FR11-AI-022", "expired token", `Bearer ${tokens.expired}`, ["pm.test('FR11-AI-022 - 403', () => pm.expect(pm.response.code).to.eql(403));"]));
ai.push(getItem("FR11-AI-023", "tampered token", `Bearer ${tokens.tampered}`, ["pm.test('FR11-AI-023 - 403', () => pm.expect(pm.response.code).to.eql(403));"]));
ai.push(getItem("FR11-AI-024", "algorithm none", `Bearer ${tokens.none}`, ["pm.test('FR11-AI-024 - 403', () => pm.expect(pm.response.code).to.eql(403));"]));
ai.push(getItem("FR11-AI-025", "Basic scheme", "Basic {{testToken}}", ["pm.test('FR11-AI-025 - 401', () => pm.expect(pm.response.code).to.eql(401));"]));
ai.push(getItem("FR11-AI-026", "lowercase bearer", "bearer {{testToken}}", ["pm.test('FR11-AI-026 - lowercase scheme accepted', () => pm.expect(pm.response.code).to.eql(200));"]));
ai.push(getItem("FR11-AI-027", "two spaces before token", "Bearer  {{testToken}}", ["pm.test('FR11-AI-027 - malformed spacing returns 401', () => pm.expect(pm.response.code).to.eql(401));"]));
ai.push(getItem("FR11-AI-028", "deleted principal", `Bearer ${tokens.deleted}`, ["pm.test('FR11-AI-028 - deleted principal returns 404', () => pm.expect(pm.response.code).to.eql(404));"]));
ai.push(getItem("FR11-AI-029", "admin personal history", "Bearer {{adminToken}}", ["pm.test('FR11-AI-029 - admin sees only own empty history', () => { pm.expect(pm.response.code).to.eql(200); pm.expect(pm.response.json()).to.eql([]); });"]));
ai.push(getItem("FR11-AI-030", "cross-user isolation", "Bearer {{threeToken}}", ["pm.test('FR11-AI-030 - only three expected totals', () => pm.expect(pm.response.json().map(x=>x.total_amount).sort()).to.eql([100000,200000,300000]));"]));
ai.push(getItem("FR11-AI-031", "user_id query ignored", "Bearer {{emptyToken}}", ["pm.test('FR11-AI-031 - query cannot select another user', () => pm.expect(pm.response.json()).to.eql([]));"], "/api/orders/my-orders?user_id=3"));
ai.push(getItem("FR11-AI-032", "SQL-like unrecognized query", "Bearer {{emptyToken}}", ["pm.test('FR11-AI-032 - no SQL leak or foreign data', () => { pm.expect(pm.response.code).to.eql(200); pm.expect(pm.response.json()).to.eql([]); pm.expect(pm.response.text().toLowerCase()).not.to.include('sql'); });"], "/api/orders/my-orders?user_id=%27%20OR%201%3D1%20--"));
ai.push(getItem("FR11-AI-033", "role query ignored", "Bearer {{emptyToken}}", ["pm.test('FR11-AI-033 - query cannot elevate role', () => pm.expect(pm.response.json()).to.eql([]));"], "/api/orders/my-orders?role=admin"));
ai.push(getItem("FR11-AI-034", "data minimization", "Bearer {{oneToken}}", ["pm.test('FR11-AI-034 - no sensitive user fields', () => pm.response.json().forEach(x=>['password','reset_token','login_attempts','name','email'].forEach(k=>pm.expect(x).not.to.have.property(k))));"]));
ai.push(getItem("FR11-AI-035", "foreign cardinality isolation", "Bearer {{emptyToken}}", ["pm.test('FR11-AI-035 - empty user unaffected by 1000 foreign orders', () => pm.expect(pm.response.json()).to.eql([]));"]));
ai.push(getItem("FR11-AI-036", "repeatable GET", "Bearer {{threeToken}}", [
  "const first=pm.response.text();",
  "pm.sendRequest({url:pm.collectionVariables.get('baseUrl')+'/api/orders/my-orders',method:'GET',header:{Authorization:'Bearer '+pm.collectionVariables.get('threeToken'),'X-Student-Id':pm.collectionVariables.get('studentId')}},(err,res)=>pm.test('FR11-AI-036 - repeated body equivalent',()=>{pm.expect(err).to.eql(null);pm.expect(res.text()).to.eql(first);}));",
]));
ai.push(getItem("FR11-AI-037", "ten concurrent reads", "Bearer {{threeToken}}", [
  "const expected=pm.response.text(); let completed=0; let consistent=true;",
  "for(let i=0;i<10;i++) pm.sendRequest({url:pm.collectionVariables.get('baseUrl')+'/api/orders/my-orders',method:'GET',header:{Authorization:'Bearer '+pm.collectionVariables.get('threeToken'),'X-Student-Id':pm.collectionVariables.get('studentId')}},(err,res)=>{completed++;consistent=consistent&&!err&&res.code===200&&res.text()===expected;if(completed===10)pm.test('FR11-AI-037 - concurrent reads consistent',()=>pm.expect(consistent).to.eql(true));});",
]));
ai.push({ name: "FR11-AI-038 unsupported POST", request: { method:"POST", header:[studentHeader,authHeader("Bearer {{testToken}}")], url:urlObject("{{baseUrl}}/api/orders/my-orders") }, event:testEvent(["pm.test('FR11-AI-038 - nonexistent POST is 404',()=>pm.expect(pm.response.code).to.eql(404));"]) });
ai.push(getItem("FR11-AI-039", "JSON response media", "Bearer {{oneToken}}", ["pm.test('FR11-AI-039 - JSON array response',()=>{pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');pm.expect(pm.response.json()).to.be.an('array');});"]));
ai.push(getItem("FR11-AI-040", "local response-time observation", "Bearer {{oneToken}}", ["console.log('FR11-AI-040 response time ms:',pm.response.responseTime);pm.test('FR11-AI-040 - response is measurable',()=>pm.expect(pm.response.responseTime).to.be.a('number'));"]));

const human = [];
human.push(getItem("FR11-H-001", "forged JWT using exposed secret", `Bearer ${tokens.forgedUserB}`, ["pm.test('FR11-H-001 - forged token rejected',()=>pm.expect(pm.response.code).to.eql(403));"]));
human.push(getItem("FR11-H-002", "signed token missing id", `Bearer ${tokens.missingId}`, ["pm.test('FR11-H-002 - missing subject rejected',()=>pm.expect(pm.response.code).to.eql(403));"]));
human.push(getItem("FR11-H-003", "invalid claim types", "Bearer {{testToken}}", [
  `const invalidTokens=${JSON.stringify([tokens.stringId,tokens.nullId,tokens.negativeId,tokens.sqlId])}; let done=0; let codes=[];`,
  "invalidTokens.forEach(token=>pm.sendRequest({url:pm.collectionVariables.get('baseUrl')+'/api/orders/my-orders',method:'GET',header:{Authorization:'Bearer '+token,'X-Student-Id':pm.collectionVariables.get('studentId')}},(err,res)=>{done++;codes.push(err?0:res.code);if(done===invalidTokens.length)pm.test('FR11-H-003 - invalid id claims rejected',()=>pm.expect(codes).to.eql([403,403,403,403]));}));",
]));
human.push(getItem("FR11-H-004", "no-store cache control", "Bearer {{oneToken}}", ["pm.test('FR11-H-004 - sensitive response is not cacheable',()=>pm.expect((pm.response.headers.get('Cache-Control')||'').toLowerCase()).to.include('no-store'));"]));
human.push(getItem("FR11-H-005", "two-token smuggling", "Bearer {{testToken}}, Bearer {{adminToken}}", ["pm.test('FR11-H-005 - ambiguous credentials rejected',()=>pm.expect(pm.response.code).to.be.oneOf([401,403]));"]));
human.push(getItem("FR11-H-006", "post-deletion token race", "Bearer {{raceToken}}", [
  "const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');const admin=pm.collectionVariables.get('adminToken');const race=pm.collectionVariables.get('raceToken');",
  "pm.sendRequest({url:base+'/api/admin/users/8',method:'DELETE',header:{Authorization:'Bearer '+admin,'X-Student-Id':sid}},(deleteErr,deleteRes)=>{pm.sendRequest({url:base+'/api/orders/my-orders',method:'GET',header:{Authorization:'Bearer '+race,'X-Student-Id':sid}},(readErr,readRes)=>pm.test('FR11-H-006 - old token rejected after deletion',()=>{pm.expect(deleteErr).to.eql(null);pm.expect(deleteRes.code).to.eql(200);pm.expect(readErr).to.eql(null);pm.expect(readRes.code).to.eql(404);}));});",
]));
human.push(getItem("FR11-H-007", "1000-order foreign sentinel isolation", "Bearer {{largeToken}}", [...strictSchema,
  "pm.test('FR11-H-007 - exactly 1000 authorized orders',()=>pm.expect(pm.response.json()).to.have.length(1000));",
  "pm.test('FR11-H-007 - no foreign sentinel',()=>pm.expect(pm.response.text()).not.to.include('FOREIGN-SENTINEL-ORDER'));",
  "pm.test('FR11-H-007 - strict schema at scale',()=>pm.response.json().forEach(assertStrictOrder));",
]));

collection.item = collection.item.filter((folder) => !folder.name.startsWith("FR-11"));
collection.item.push(
  { name: "FR-11 Setup", item: setupItems },
  { name: "FR-11 Order History - audited AI cases", item: ai },
  { name: "FR-11 Order History - student-selected extensions", item: human },
);
fs.writeFileSync(collectionPath, `${JSON.stringify(collection, null, 2)}\n`, "utf8");
console.log(`Updated ${collectionPath}`);
console.log(`FR-11 case count: ${ai.length + human.length}; setup requests: ${setupItems.length}`);
