const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const collectionPath = path.resolve(__dirname, "..", "postman", "eshop-hw06.postman_collection.json");
const collection = JSON.parse(fs.readFileSync(collectionPath, "utf8"));
const secret = "super_secret_key_that_should_not_be_here";
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
function signJwt(payload) {
  const unsigned = `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}`;
  return `${unsigned}.${crypto.createHmac("sha256", secret).update(unsigned).digest("base64url")}`;
}
const tokens = {
  admin: signJwt({ id: 1, role: "admin", exp: 4102444800 }),
  user: signJwt({ id: 2, role: "user", exp: 4102444800 }),
  expired: signJwt({ id: 1, role: "admin", exp: 1 }),
  forgedAdmin: signJwt({ id: 2, role: "admin", exp: 4102444800 }),
};

const studentHeader = { key: "X-Student-Id", value: "{{studentId}}", type: "text" };
const h = (key, value) => ({ key, value, type: "text" });
const urlObject = (raw) => ({ raw, host: ["{{baseUrl}}"], path: raw.replace(/^\{\{baseUrl\}\}\//, "").split("?")[0].split("/") });
const event = (lines) => [{ listen: "test", script: { type: "text/javascript", exec: lines } }];
const original = (id) => `FR14-ORIGINAL-${String(id).padStart(3, "0")}`;

function putItem(id, label, target, rawBody, testLines, options = {}) {
  const headers = [studentHeader];
  if (options.auth !== null) headers.push(h("Authorization", options.auth === undefined ? `Bearer ${tokens.admin}` : options.auth));
  if (options.contentType !== null) headers.push(h("Content-Type", options.contentType || "application/json"));
  if (options.accept) headers.push(h("Accept", options.accept));
  if (options.extraHeaders) headers.push(...options.extraHeaders);
  const request = { method: "PUT", header: headers, url: urlObject(`{{baseUrl}}/api/categories/${target}${options.query || ""}`) };
  if (rawBody !== undefined) request.body = { mode: "raw", raw: rawBody };
  return { name: `${id} ${label}`, request, event: event(testLines) };
}
function workflowItem(id, label, testLines) {
  return { name: `${id} ${label}`, request: { method: "GET", header: [studentHeader], url: urlObject("{{baseUrl}}/api/categories") }, event: event(testLines) };
}
const json = (value) => JSON.stringify(value);
const status = (id, code) => [`pm.test('${id} - HTTP ${code}',()=>pm.expect(pm.response.code).to.eql(${code}));`];
const updated = (id, target, expectedName) => [
  `pm.test('${id} - exact success response',()=>{pm.expect(pm.response.code).to.eql(200);pm.expect(pm.response.json()).to.eql({message:'Category updated'});});`,
  `if(pm.response.code===200){const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(err,res)=>pm.test('${id} - same ID has exact new name',()=>{pm.expect(err).to.eql(null);const rows=res.json();pm.expect(rows.filter(x=>x.id===${target})).to.have.length(1);pm.expect(rows.find(x=>x.id===${target}).name).to.eql(${JSON.stringify(expectedName)});}));}`,
];
const observation = (id) => [`console.log('${id} observed status/body:',pm.response.code,pm.response.text());`, `pm.test('${id} - unspecified length outcome recorded',()=>pm.expect(pm.response.code).to.be.a('number'));`];

const ai = [];
ai.push(putItem("FR14PUT-AI-001", "ordinary rename", 1, json({ name: "FR14-AI-001-UPDATED" }), updated("FR14PUT-AI-001", 1, "FR14-AI-001-UPDATED")));
ai.push(putItem("FR14PUT-AI-002", "Vietnamese Unicode", 2, json({ name: "Điện thoại thông minh" }), updated("FR14PUT-AI-002", 2, "Điện thoại thông minh")));
ai.push(putItem("FR14PUT-AI-003", "composed Vietnamese", 3, json({ name: "Cà phê sữa đá" }), updated("FR14PUT-AI-003", 3, "Cà phê sữa đá")));
ai.push(putItem("FR14PUT-AI-004", "one-character name", 4, json({ name: "Z" }), updated("FR14PUT-AI-004", 4, "Z")));
ai.push(putItem("FR14PUT-AI-005", "255-character observation", 5, json({ name: "a".repeat(255) }), observation("FR14PUT-AI-005")));
ai.push(putItem("FR14PUT-AI-006", "256-character observation", 6, json({ name: "b".repeat(256) }), observation("FR14PUT-AI-006")));
ai.push(putItem("FR14PUT-AI-007", "trim whitespace", 7, json({ name: "  FR14-AI-007-UPDATED  " }), updated("FR14PUT-AI-007", 7, "FR14-AI-007-UPDATED")));
for (const [n, body] of [[8,{name:" "}],[9,{name:"\t\n"}],[10,{}],[11,{name:""}],[12,{name:null}],[13,{name:14}],[14,{name:true}],[15,{name:{value:"x"}}],[16,{name:["x"]}]]) {
  const id=`FR14PUT-AI-${String(n).padStart(3,"0")}`; ai.push(putItem(id,"invalid name",n,json(body),status(id,400)));
}
ai.push(putItem("FR14PUT-AI-017", "missing body", 17, undefined, status("FR14PUT-AI-017", 400)));
ai.push(putItem("FR14PUT-AI-018", "malformed JSON", 18, "{\"name\":", [...status("FR14PUT-AI-018",400),"pm.test('FR14PUT-AI-018 - no stack/internal path',()=>pm.expect(pm.response.text().toLowerCase()).not.to.include('node_modules')); "]));
ai.push(putItem("FR14PUT-AI-019", "text/plain JSON", 19, json({name:"FR14-AI-019"}), status("FR14PUT-AI-019",415), {contentType:"text/plain"}));
ai.push(putItem("FR14PUT-AI-020", "form body", 20, "name=FR14-AI-020", status("FR14PUT-AI-020",415), {contentType:"application/x-www-form-urlencoded"}));
ai.push(putItem("FR14PUT-AI-021", "smallest positive ID", 21, json({name:"FR14-AI-021-UPDATED"}), updated("FR14PUT-AI-021",21,"FR14-AI-021-UPDATED")));
ai.push(putItem("FR14PUT-AI-022", "nonexistent ID", 9999, json({name:"FR14-AI-022"}), status("FR14PUT-AI-022",404)));
for (const [n,target] of [[23,"0"],[24,"-1"],[25,"1.5"],[26,"abc"],[27,"%27%20OR%201%3D1%20--"]]) { const id=`FR14PUT-AI-${String(n).padStart(3,"0")}`; ai.push(putItem(id,"invalid ID",target,json({name:`FR14-AI-${n}`}),status(id,400))); }
ai.push(putItem("FR14PUT-AI-028", "missing Authorization", 28, json({name:"FR14-AI-028"}), status("FR14PUT-AI-028",401), {auth:null}));
ai.push(putItem("FR14PUT-AI-029", "empty Authorization", 29, json({name:"FR14-AI-029"}), status("FR14PUT-AI-029",401), {auth:""}));
ai.push(putItem("FR14PUT-AI-030", "malformed token", 30, json({name:"FR14-AI-030"}), status("FR14PUT-AI-030",403), {auth:"Bearer malformed"}));
ai.push(putItem("FR14PUT-AI-031", "expired token", 31, json({name:"FR14-AI-031"}), status("FR14PUT-AI-031",403), {auth:`Bearer ${tokens.expired}`}));
ai.push(putItem("FR14PUT-AI-032", "normal user forbidden", 32, json({name:"FR14-AI-032"}), status("FR14PUT-AI-032",403), {auth:`Bearer ${tokens.user}`}));
ai.push(putItem("FR14PUT-AI-033", "query/header cannot elevate", 33, json({name:"FR14-AI-033"}), status("FR14PUT-AI-033",403), {auth:`Bearer ${tokens.user}`,query:"?role=admin",extraHeaders:[h("X-Role","admin")]}));
ai.push(putItem("FR14PUT-AI-034", "reject extra fields", 34, json({name:"FR14-AI-034",id:999,role:"admin"}), status("FR14PUT-AI-034",400)));
ai.push(putItem("FR14PUT-AI-035", "rename to duplicate", 35, json({name:"FR14-DUPLICATE-TARGET"}), updated("FR14PUT-AI-035",35,"FR14-DUPLICATE-TARGET")));
ai.push(putItem("FR14PUT-AI-036", "stored XSS literal", 36, json({name:"<script>alert(1)</script>"}), updated("FR14PUT-AI-036",36,"<script>alert(1)</script>")));
ai.push(putItem("FR14PUT-AI-037", "SQL-like literal", 37, json({name:"x', name='owned' --"}), updated("FR14PUT-AI-037",37,"x', name='owned' --")));
ai.push(putItem("FR14PUT-AI-038", "strict response contract", 38, json({name:"FR14-AI-038"}), updated("FR14PUT-AI-038",38,"FR14-AI-038")));
ai.push(workflowItem("FR14PUT-AI-039", "ten concurrent renames", [
  `const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');const auth='Bearer ${tokens.admin}';const names=Array.from({length:10},(_,i)=>'FR14-AI-039-'+i);const headers={'X-Student-Id':sid,Authorization:auth,'Content-Type':'application/json'};let done=0;const codes=[];`,
  "names.forEach(name=>pm.sendRequest({url:base+'/api/categories/39',method:'PUT',header:headers,body:{mode:'raw',raw:JSON.stringify({name})}},(err,res)=>{codes.push(err?0:res.code);done++;if(done===names.length)pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(e,r)=>pm.test('FR14PUT-AI-039 - one row and submitted final value',()=>{pm.expect(codes).to.have.length(10);codes.forEach(x=>pm.expect(x).to.eql(200));const rows=r.json().filter(x=>x.id===39);pm.expect(rows).to.have.length(1);pm.expect(names).to.include(rows[0].name);}));}));",
]));
ai.push(putItem("FR14PUT-AI-040", "reject HTML Accept", 40, json({name:"FR14-AI-040"}), status("FR14PUT-AI-040",406), {accept:"text/html"}));

const human=[];
human.push(putItem("FR14PUT-H-001","forged admin token",41,json({name:"FR14-H-001"}),status("FR14PUT-H-001",403),{auth:`Bearer ${tokens.forgedAdmin}`}));
human.push(putItem("FR14PUT-H-002","role/account mismatch",42,json({name:"FR14-H-002"}),status("FR14PUT-H-002",403),{auth:`Bearer ${tokens.forgedAdmin}`}));
human.push(putItem("FR14PUT-H-003","duplicate JSON keys",43,"{\"name\":\"Safe\",\"name\":\"   \"}",status("FR14PUT-H-003",400)));
human.push(putItem("FR14PUT-H-004","prototype-shaped extra field",44,"{\"name\":\"FR14-H-004\",\"__proto__\":{\"role\":\"admin\"}}",status("FR14PUT-H-004",400)));
human.push(workflowItem("FR14PUT-H-005","idempotent replay",[
  `const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');const headers={'X-Student-Id':sid,Authorization:'Bearer ${tokens.admin}','Content-Type':'application/json'};const req={url:base+'/api/categories/45',method:'PUT',header:headers,body:{mode:'raw',raw:JSON.stringify({name:'FR14-H-005-UPDATED'})}};`,
  "pm.sendRequest(req,(e1,r1)=>pm.sendRequest(req,(e2,r2)=>pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(e3,r3)=>pm.test('FR14PUT-H-005 - replay is idempotent',()=>{pm.expect(e1).to.eql(null);pm.expect(e2).to.eql(null);pm.expect(r1.code).to.eql(200);pm.expect(r2.code).to.eql(200);pm.expect(r1.json()).to.eql({message:'Category updated'});pm.expect(r2.json()).to.eql({message:'Category updated'});const rows=r3.json().filter(x=>x.id===45);pm.expect(rows).to.have.length(1);pm.expect(rows[0].name).to.eql('FR14-H-005-UPDATED');}))));",
]));
human.push(workflowItem("FR14PUT-H-006","update/delete race",[
  `const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');const headers={'X-Student-Id':sid,Authorization:'Bearer ${tokens.admin}','Content-Type':'application/json'};let done=0;let updateCode=0;let deleteCode=0;function finish(){done++;if(done===2)pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(e,r)=>pm.test('FR14PUT-H-006 - delete wins final lifecycle',()=>{pm.expect(updateCode).to.be.oneOf([200,404]);pm.expect(deleteCode).to.eql(200);pm.expect(r.json().some(x=>x.id===46)).to.eql(false);}));}`,
  "pm.sendRequest({url:base+'/api/categories/46',method:'PUT',header:headers,body:{mode:'raw',raw:JSON.stringify({name:'FR14-H-006-UPDATED'})}},(e,r)=>{updateCode=e?0:r.code;finish();});pm.sendRequest({url:base+'/api/categories/46',method:'DELETE',header:headers},(e,r)=>{deleteCode=e?0:r.code;finish();});",
]));
human.push(putItem("FR14PUT-H-007","product reference stability",47,json({name:"FR14-H-007-UPDATED"}),[
  "pm.test('FR14PUT-H-007 - exact update success',()=>{pm.expect(pm.response.code).to.eql(200);pm.expect(pm.response.json()).to.eql({message:'Category updated'});});",
  "const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/products',method:'GET',header:{'X-Student-Id':sid}},(e,r)=>pm.test('FR14PUT-H-007 - product remains unchanged',()=>{pm.expect(e).to.eql(null);const p=r.json().find(x=>x.id===1);pm.expect(p.name).to.eql('FR14-PRODUCT-SENTINEL');pm.expect(p.category_id).to.eql(47);pm.expect(p.description).to.eql('unchanged-description');}));",
]));

if(ai.length!==40||human.length!==7)throw new Error(`Unexpected PUT count: ${ai.length}/${human.length}`);
collection.item=collection.item.filter(folder=>!folder.name.startsWith("FR-14 PUT"));
collection.item.push({name:"FR-14 PUT Category - audited AI cases",item:ai},{name:"FR-14 PUT Category - student-added cases",item:human});
fs.writeFileSync(collectionPath,`${JSON.stringify(collection,null,2)}\n`,"utf8");
console.log(`Updated ${collectionPath}`);console.log(`FR-14 PUT case count: ${ai.length+human.length}`);
