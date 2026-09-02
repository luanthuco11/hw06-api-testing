const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const collectionPath = path.resolve(__dirname, "..", "postman", "eshop-hw06.postman_collection.json");
const collection = JSON.parse(fs.readFileSync(collectionPath, "utf8"));
const secret = "super_secret_key_that_should_not_be_here";
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
function signJwt(payload) { const u=`${b64({alg:"HS256",typ:"JWT"})}.${b64(payload)}`; return `${u}.${crypto.createHmac("sha256",secret).update(u).digest("base64url")}`; }
const tokens={admin:signJwt({id:1,role:"admin",exp:4102444800}),user:signJwt({id:2,role:"user",exp:4102444800}),expired:signJwt({id:1,role:"admin",exp:1}),forged:signJwt({id:2,role:"admin",exp:4102444800}),missingRole:signJwt({id:1,exp:4102444800})};
tokens.tampered=`${tokens.admin.slice(0,-1)}${tokens.admin.endsWith("A")?"B":"A"}`;
const student={key:"X-Student-Id",value:"{{studentId}}",type:"text"};
const h=(key,value)=>({key,value,type:"text"});
const url=(raw)=>({raw,host:["{{baseUrl}}"],path:raw.replace(/^\{\{baseUrl\}\}\//,"").split("?")[0].split("/")});
const test=(lines)=>[{listen:"test",script:{type:"text/javascript",exec:lines}}];

function deleteItem(id,label,target,lines,options={}){
  const headers=[student];
  if(options.auth!==null)headers.push(h("Authorization",options.auth===undefined?`Bearer ${tokens.admin}`:options.auth));
  if(options.contentType)headers.push(h("Content-Type",options.contentType));
  if(options.accept)headers.push(h("Accept",options.accept));
  if(options.extraHeaders)headers.push(...options.extraHeaders);
  const request={method:options.method||"DELETE",header:headers,url:url(`{{baseUrl}}${options.path||`/api/categories/${target}`}${options.query||""}`)};
  if(options.rawBody!==undefined)request.body={mode:"raw",raw:options.rawBody};
  return{name:`${id} ${label}`,request,event:test(lines)};
}
function workflow(id,label,lines){return{name:`${id} ${label}`,request:{method:"GET",header:[student],url:url("{{baseUrl}}/api/categories")},event:test(lines)};}
const status=(id,code)=>[`pm.test('${id} - HTTP ${code}',()=>pm.expect(pm.response.code).to.eql(${code}));`];
const deleted=(id,target)=>[
  `pm.test('${id} - exact delete response',()=>{pm.expect(pm.response.code).to.eql(200);pm.expect(pm.response.json()).to.eql({message:'Category deleted'});});`,
  `if(pm.response.code===200){const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(e,r)=>pm.test('${id} - target absent',()=>{pm.expect(e).to.eql(null);pm.expect(r.json().some(x=>x.id===${target})).to.eql(false);}));}`,
];
const remains=(id,target,code)=>[
  ...status(id,code),
  `const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(e,r)=>pm.test('${id} - target remains',()=>{pm.expect(e).to.eql(null);pm.expect(r.json().some(x=>x.id===${target})).to.eql(true);}));`,
];

const single=[deleteItem("FR14DELETE-AI-002","delete only category",1,[
  "pm.test('FR14DELETE-AI-002 - exact success',()=>{pm.expect(pm.response.code).to.eql(200);pm.expect(pm.response.json()).to.eql({message:'Category deleted'});});",
  "const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(e,r)=>pm.test('FR14DELETE-AI-002 - empty final list',()=>{pm.expect(e).to.eql(null);pm.expect(r.json()).to.eql([]);}));",
])];

const ai=[];
ai.push(deleteItem("FR14DELETE-AI-001","ordinary delete",1,deleted("FR14DELETE-AI-001",1)));
for(const n of [3,4,5])ai.push(deleteItem(`FR14DELETE-AI-00${n}`,"position-targeted delete",n,deleted(`FR14DELETE-AI-00${n}`,n)));
ai.push(deleteItem("FR14DELETE-AI-006","delete one duplicate by ID",6,[...deleted("FR14DELETE-AI-006",6),"const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(e,r)=>pm.test('FR14DELETE-AI-006 - other duplicate remains',()=>pm.expect(r.json().some(x=>x.id===60&&x.name==='FR14-DELETE-DUPLICATE')).to.eql(true))); "]));
ai.push(deleteItem("FR14DELETE-AI-007","nonexistent positive ID",9999,status("FR14DELETE-AI-007",404)));
for(const [n,target] of [[8,"0"],[9,"-1"],[10,"1.5"],[11,"abc"],[12,"%27%20OR%201%3D1%20--"]]){const id=`FR14DELETE-AI-${String(n).padStart(3,"0")}`;ai.push(deleteItem(id,"invalid ID",target,status(id,400)));}
ai.push(deleteItem("FR14DELETE-AI-013","very large positive ID","9007199254740991",status("FR14DELETE-AI-013",404)));
ai.push(deleteItem("FR14DELETE-AI-014","leading-zero valid ID","0014",deleted("FR14DELETE-AI-014",14)));
ai.push(deleteItem("FR14DELETE-AI-015","encoded plus ID","%2B15",remains("FR14DELETE-AI-015",15,400)));
ai.push(deleteItem("FR14DELETE-AI-016","missing path ID","",status("FR14DELETE-AI-016",404),{path:"/api/categories"}));
ai.push(deleteItem("FR14DELETE-AI-017","extra path segment",17,status("FR14DELETE-AI-017",404),{path:"/api/categories/17/extra"}));
ai.push(deleteItem("FR14DELETE-AI-018","missing Authorization",18,remains("FR14DELETE-AI-018",18,401),{auth:null}));
ai.push(deleteItem("FR14DELETE-AI-019","empty Authorization",19,remains("FR14DELETE-AI-019",19,401),{auth:""}));
ai.push(deleteItem("FR14DELETE-AI-020","Bearer no credential",20,remains("FR14DELETE-AI-020",20,401),{auth:"Bearer"}));
ai.push(deleteItem("FR14DELETE-AI-021","malformed token",21,remains("FR14DELETE-AI-021",21,403),{auth:"Bearer malformed"}));
ai.push(deleteItem("FR14DELETE-AI-022","expired token",22,remains("FR14DELETE-AI-022",22,403),{auth:`Bearer ${tokens.expired}`}));
ai.push(deleteItem("FR14DELETE-AI-023","tampered token",23,remains("FR14DELETE-AI-023",23,403),{auth:`Bearer ${tokens.tampered}`}));
ai.push(deleteItem("FR14DELETE-AI-024","normal user forbidden",24,remains("FR14DELETE-AI-024",24,403),{auth:`Bearer ${tokens.user}`}));
ai.push(deleteItem("FR14DELETE-AI-025","query cannot elevate",25,remains("FR14DELETE-AI-025",25,403),{auth:`Bearer ${tokens.user}`,query:"?role=admin"}));
ai.push(deleteItem("FR14DELETE-AI-026","header cannot elevate",26,remains("FR14DELETE-AI-026",26,403),{auth:`Bearer ${tokens.user}`,extraHeaders:[h("X-Role","admin")]}));
ai.push(deleteItem("FR14DELETE-AI-027","strict response contract",27,deleted("FR14DELETE-AI-027",27)));
ai.push(deleteItem("FR14DELETE-AI-028","repeat delete",28,[
  "pm.test('FR14DELETE-AI-028 - first exact success',()=>{pm.expect(pm.response.code).to.eql(200);pm.expect(pm.response.json()).to.eql({message:'Category deleted'});});",
  `const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories/28',method:'DELETE',header:{'X-Student-Id':sid,Authorization:'Bearer ${tokens.admin}'}},(e,r)=>pm.test('FR14DELETE-AI-028 - repeat is 404',()=>{pm.expect(e).to.eql(null);pm.expect(r.code).to.eql(404);}));`,
]));
ai.push(workflow("FR14DELETE-AI-029","ten concurrent same-ID deletes",[
  `const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');const headers={'X-Student-Id':sid,Authorization:'Bearer ${tokens.admin}'};let done=0;const codes=[];`,
  "for(let i=0;i<10;i++)pm.sendRequest({url:base+'/api/categories/29',method:'DELETE',header:headers},(e,r)=>{codes.push(e?0:r.code);done++;if(done===10)pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(ge,gr)=>pm.test('FR14DELETE-AI-029 - one success and nine not-found',()=>{pm.expect(codes.filter(x=>x===200)).to.have.length(1);pm.expect(codes.filter(x=>x===404)).to.have.length(9);pm.expect(gr.json().some(x=>x.id===29)).to.eql(false);}));});",
]));
ai.push(workflow("FR14DELETE-AI-030","ten concurrent distinct deletes",[
  `const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');const headers={'X-Student-Id':sid,Authorization:'Bearer ${tokens.admin}'};const ids=[30,61,62,63,64,65,66,67,68,69];let done=0;const codes=[];`,
  "ids.forEach(id=>pm.sendRequest({url:base+'/api/categories/'+id,method:'DELETE',header:headers},(e,r)=>{codes.push(e?0:r.code);done++;if(done===ids.length)pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(ge,gr)=>pm.test('FR14DELETE-AI-030 - all distinct targets deleted',()=>{pm.expect(codes).to.have.length(10);codes.forEach(x=>pm.expect(x).to.eql(200));const remaining=new Set(gr.json().map(x=>x.id));ids.forEach(x=>pm.expect(remaining.has(x)).to.eql(false));}));}));",
]));
ai.push(deleteItem("FR14DELETE-AI-031","referenced category protected",31,remains("FR14DELETE-AI-031",31,409)));
ai.push(deleteItem("FR14DELETE-AI-032","unrelated delete preserves reference",32,[...deleted("FR14DELETE-AI-032",32),"const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/products',method:'GET',header:{'X-Student-Id':sid}},(e,r)=>pm.test('FR14DELETE-AI-032 - unrelated product reference intact',()=>{const p=r.json().find(x=>x.id===2);pm.expect(p.category_id).to.eql(70);}));"]));
ai.push(deleteItem("FR14DELETE-AI-033","unknown force query ignored",33,deleted("FR14DELETE-AI-033",33),{query:"?force=true"}));
ai.push(deleteItem("FR14DELETE-AI-034","body-free delete",34,deleted("FR14DELETE-AI-034",34)));
ai.push(deleteItem("FR14DELETE-AI-035","empty JSON object allowed",35,deleted("FR14DELETE-AI-035",35),{contentType:"application/json",rawBody:"{}"}));
ai.push(deleteItem("FR14DELETE-AI-036","body ID conflict rejected",36,remains("FR14DELETE-AI-036",36,400),{contentType:"application/json",rawBody:'{"id":37}'}));
ai.push(deleteItem("FR14DELETE-AI-037","text body rejected",37,remains("FR14DELETE-AI-037",37,415),{contentType:"text/plain",rawBody:"force"}));
ai.push(deleteItem("FR14DELETE-AI-038","HTML Accept rejected",38,remains("FR14DELETE-AI-038",38,406),{accept:"text/html"}));
ai.push(deleteItem("FR14DELETE-AI-039","CORS preflight",39,["pm.test('FR14DELETE-AI-039 - controlled preflight',()=>{pm.expect(pm.response.code).to.be.oneOf([200,204]);pm.expect(pm.response.headers.get('Access-Control-Allow-Methods')).to.include('DELETE');pm.expect((pm.response.headers.get('Access-Control-Allow-Credentials')||'').toLowerCase()).not.to.eql('true');});","const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(e,r)=>pm.test('FR14DELETE-AI-039 - OPTIONS did not delete',()=>pm.expect(r.json().some(x=>x.id===39)).to.eql(true)));"],{method:"OPTIONS",extraHeaders:[h("Origin","https://student.example"),h("Access-Control-Request-Method","DELETE")]}));
ai.push(deleteItem("FR14DELETE-AI-040","non-resurrection",40,[...deleted("FR14DELETE-AI-040",40),"const base=pm.collectionVariables.get('baseUrl');const sid=pm.collectionVariables.get('studentId');let done=0;let absent=true;for(let i=0;i<10;i++)pm.sendRequest({url:base+'/api/categories',method:'GET',header:{'X-Student-Id':sid}},(e,r)=>{done++;absent=absent&&!e&&!r.json().some(x=>x.id===40);if(done===10)pm.test('FR14DELETE-AI-040 - target never reappears',()=>pm.expect(absent).to.eql(true));});"]));

const human=[];
human.push(deleteItem("FR14DELETE-H-001","forged admin token",50,remains("FR14DELETE-H-001",50,403),{auth:`Bearer ${tokens.forged}`}));
human.push(deleteItem("FR14DELETE-H-002","role/account mismatch",51,remains("FR14DELETE-H-002",51,403),{auth:`Bearer ${tokens.forged}`}));
human.push(deleteItem("FR14DELETE-H-003","missing role claim",52,remains("FR14DELETE-H-003",52,403),{auth:`Bearer ${tokens.missingRole}`}));
human.push(deleteItem("FR14DELETE-H-004","two-token smuggling",53,remains("FR14DELETE-H-004",53,403),{auth:`Bearer ${tokens.user}, Bearer ${tokens.admin}`}));
human.push(deleteItem("FR14DELETE-H-005","duplicate conflicting body IDs",54,remains("FR14DELETE-H-005",54,400),{contentType:"application/json",rawBody:'{"id":10,"id":11}'}));
human.push(deleteItem("FR14DELETE-H-006","prototype-shaped body",55,remains("FR14DELETE-H-006",55,400),{contentType:"application/json",rawBody:'{"__proto__":{"force":true}}'}));
human.push(deleteItem("FR14DELETE-H-007","4096-digit ID","9".repeat(4096),[...status("FR14DELETE-H-007",400),"pm.test('FR14DELETE-H-007 - no internal disclosure',()=>{const b=pm.response.text().toLowerCase();pm.expect(b).not.to.include('sqlite');pm.expect(b).not.to.include('node_modules');});"]));

if(ai.length!==39||single.length!==1||human.length!==7)throw new Error(`Unexpected DELETE count ${ai.length}/${single.length}/${human.length}`);
collection.item=collection.item.filter(f=>!f.name.startsWith("FR-14 DELETE"));
collection.item.push({name:"FR-14 DELETE Category - single fixture",item:single},{name:"FR-14 DELETE Category - main audited AI cases",item:ai},{name:"FR-14 DELETE Category - student-added cases",item:human});
fs.writeFileSync(collectionPath,`${JSON.stringify(collection,null,2)}\n`,"utf8");
console.log(`Updated ${collectionPath}`);console.log(`FR-14 DELETE case count: ${single.length+ai.length+human.length}`);
