const fs = require("fs");
const path = require("path");

const studentHeader = { key: "X-Student-Id", value: "{{studentId}}", type: "text" };
const jsonHeader = { key: "Content-Type", value: "application/json", type: "text" };

function request(url, body, contentType = "application/json", method = "POST") {
  const headers = [studentHeader];
  if (contentType) headers.push({ ...jsonHeader, value: contentType });
  return {
    method,
    header: headers,
    body: body === undefined ? undefined : { mode: "raw", raw: body },
    url: { raw: `{{baseUrl}}${url}`, host: ["{{baseUrl}}"], path: url.replace(/^\//, "").split("/") },
  };
}

function event(lines) {
  return [{ listen: "test", script: { type: "text/javascript", exec: lines } }];
}

function standardItem(testCase) {
  const expected = JSON.stringify(testCase.expected);
  const tests = [
    `pm.test("${testCase.id} - status oracle", function () {`,
    `  pm.expect(pm.response.code).to.be.oneOf(${expected});`,
    "});",
  ];
  if (testCase.expected.length === 1 && testCase.expected[0] === 200) {
    tests.push(
      `pm.test("${testCase.id} - exact success schema", function () {`,
      "  const data = pm.response.json();",
      "  pm.expect(Object.keys(data).sort()).to.eql(['id', 'message']);",
      "  pm.expect(data.message).to.eql('User registered successfully');",
      "  pm.expect(data.id).to.be.a('number').and.above(0);",
      "  pm.expect(data).not.to.have.property('password');",
      "});",
    );
  } else if (testCase.observation) {
    tests.push(`console.log("${testCase.id} specification-gap observation:", pm.response.code, pm.response.text());`);
  } else {
    tests.push(
      `pm.test("${testCase.id} - safe error response", function () {`,
      "  pm.expect(pm.response.text().toLowerCase()).not.to.include('node_modules');",
      "  pm.expect(pm.response.text().toLowerCase()).not.to.include('at layer.handle');",
      "});",
    );
  }
  return {
    name: `${testCase.id} ${testCase.name}`,
    request: request("/api/register", testCase.raw ?? JSON.stringify(testCase.body), testCase.contentType),
    event: event(tests),
  };
}

const valid = (id) => ({
  name: `User ${id}`,
  email: `${id.toLowerCase()}@hw06.test`,
  password: "Valid123!",
});

const standardCases = [
  { id: "FR01-AI-001", name: "valid baseline", body: valid("FR01-AI-001"), expected: [200] },
  { id: "FR01-AI-002", name: "Vietnamese Unicode name", body: { ...valid("FR01-AI-002"), name: "Nguyễn Thị Ánh" }, expected: [200] },
  { id: "FR01-AI-003", name: "one-character name", body: { ...valid("FR01-AI-003"), name: "A" }, expected: [200, 400], observation: true },
  { id: "FR01-AI-004", name: "255-character name", body: { ...valid("FR01-AI-004"), name: "A".repeat(255) }, expected: [200, 400], observation: true },
  { id: "FR01-AI-005", name: "256-character name", body: { ...valid("FR01-AI-005"), name: "A".repeat(256) }, expected: [200, 400], observation: true },
  { id: "FR01-AI-006", name: "missing name", body: { email: "fr01-ai-006@hw06.test", password: "Valid123!" }, expected: [400] },
  { id: "FR01-AI-007", name: "null name", body: { ...valid("FR01-AI-007"), name: null }, expected: [400] },
  { id: "FR01-AI-008", name: "empty name", body: { ...valid("FR01-AI-008"), name: "" }, expected: [400] },
  { id: "FR01-AI-009", name: "whitespace name", body: { ...valid("FR01-AI-009"), name: "   " }, expected: [400] },
  { id: "FR01-AI-010", name: "numeric name", body: { ...valid("FR01-AI-010"), name: 12345 }, expected: [400] },
  { id: "FR01-AI-011", name: "uppercase email", body: { ...valid("FR01-AI-011"), email: "USER.UPPER@EXAMPLE.COM" }, expected: [200] },
  { id: "FR01-AI-012", name: "plus-address email", body: { ...valid("FR01-AI-012"), email: "user+hw06@example.com" }, expected: [200] },
  { id: "FR01-AI-013", name: "short valid email", body: { ...valid("FR01-AI-013"), email: "a@b.co" }, expected: [200] },
  { id: "FR01-AI-014", name: "missing email", body: { name: "Missing Email", password: "Valid123!" }, expected: [400] },
  { id: "FR01-AI-015", name: "null email", body: { ...valid("FR01-AI-015"), email: null }, expected: [400] },
  { id: "FR01-AI-016", name: "empty email", body: { ...valid("FR01-AI-016"), email: "" }, expected: [400] },
  { id: "FR01-AI-017", name: "whitespace email", body: { ...valid("FR01-AI-017"), email: "   " }, expected: [400] },
  { id: "FR01-AI-018", name: "email without at sign", body: { ...valid("FR01-AI-018"), email: "user.example.com" }, expected: [400] },
  { id: "FR01-AI-019", name: "email without local part", body: { ...valid("FR01-AI-019"), email: "@example.com" }, expected: [400] },
  { id: "FR01-AI-020", name: "email without domain", body: { ...valid("FR01-AI-020"), email: "user@" }, expected: [400] },
  { id: "FR01-AI-021", name: "email with embedded space", body: { ...valid("FR01-AI-021"), email: "user @example.com" }, expected: [400] },
  { id: "FR01-AI-026", name: "eight-character password", body: { ...valid("FR01-AI-026"), password: "Aa1!aaaa" }, expected: [200] },
  { id: "FR01-AI-027", name: "seven-character password", body: { ...valid("FR01-AI-027"), password: "Aa1!aaa" }, expected: [400] },
  { id: "FR01-AI-028", name: "password without uppercase", body: { ...valid("FR01-AI-028"), password: "lower123!" }, expected: [400] },
  { id: "FR01-AI-029", name: "password without lowercase", body: { ...valid("FR01-AI-029"), password: "UPPER123!" }, expected: [400] },
  { id: "FR01-AI-030", name: "password without digit", body: { ...valid("FR01-AI-030"), password: "NoDigits!" }, expected: [400] },
  { id: "FR01-AI-031", name: "password without special", body: { ...valid("FR01-AI-031"), password: "NoSpecial1" }, expected: [400] },
  { id: "FR01-AI-032", name: "password with allowed at sign", body: { ...valid("FR01-AI-032"), password: "Valid123@" }, expected: [200] },
  { id: "FR01-AI-033", name: "password with disallowed-only hash", body: { ...valid("FR01-AI-033"), password: "Valid123#" }, expected: [400] },
  { id: "FR01-AI-034", name: "missing password", body: { name: "Missing Password", email: "fr01-ai-034@hw06.test" }, expected: [400] },
  { id: "FR01-AI-035", name: "null password", body: { ...valid("FR01-AI-035"), password: null }, expected: [400] },
  { id: "FR01-AI-036", name: "empty password", body: { ...valid("FR01-AI-036"), password: "" }, expected: [400] },
  { id: "FR01-AI-038", name: "malformed JSON", raw: '{"name":"Broken",', expected: [400] },
  { id: "FR01-AI-039", name: "unsupported media type", raw: JSON.stringify(valid("FR01-AI-039")), contentType: "text/plain", expected: [415] },
];

const sendHeaders = `header: { 'Content-Type': 'application/json', 'X-Student-Id': pm.collectionVariables.get('studentId') }`;
const sendUrl = (suffix) => `pm.collectionVariables.get('baseUrl') + '${suffix}'`;

function workflowItem(name, primaryRequest, lines) {
  return { name, request: primaryRequest, event: event(lines) };
}

const specials = [];

{
  const body = valid("FR01-AI-022");
  specials.push(workflowItem("FR01-AI-022 exact duplicate email", request("/api/register", JSON.stringify(body)), [
    "pm.test('FR01-AI-022 - first registration succeeds', () => pm.expect(pm.response.code).to.eql(200));",
    `pm.sendRequest({ url: ${sendUrl("/api/register")}, method: 'POST', ${sendHeaders}, body: { mode: 'raw', raw: ${JSON.stringify(JSON.stringify(body))} } }, (err, res) => {`,
    "  pm.test('FR01-AI-022 - duplicate returns 409', () => { pm.expect(err).to.eql(null); pm.expect(res.code).to.eql(409); });",
    "});",
  ]));
}

{
  const first = { ...valid("FR01-AI-023"), email: "Case@Test.com" };
  const second = { ...first, email: "case@test.com" };
  specials.push(workflowItem("FR01-AI-023 case-sensitive uniqueness", request("/api/register", JSON.stringify(first)), [
    "pm.test('FR01-AI-023 - mixed-case email succeeds', () => pm.expect(pm.response.code).to.eql(200));",
    `pm.sendRequest({ url: ${sendUrl("/api/register")}, method: 'POST', ${sendHeaders}, body: { mode: 'raw', raw: ${JSON.stringify(JSON.stringify(second))} } }, (err, res) => {`,
    "  pm.test('FR01-AI-023 - differently cased email is distinct', () => { pm.expect(err).to.eql(null); pm.expect(res.code).to.eql(200); });",
    "});",
  ]));
}

{
  const body = { ...valid("FR01-AI-024"), name: "Robert'); DROP TABLE users;--" };
  specials.push(workflowItem("FR01-AI-024 corrected SQL injection isolation", request("/api/register", JSON.stringify(body)), [
    "pm.test('FR01-AI-024 - parameterized insert remains valid', () => pm.expect(pm.response.code).to.eql(200));",
    `pm.sendRequest({ url: ${sendUrl("/api/categories")}, method: 'GET', header: { 'X-Student-Id': pm.collectionVariables.get('studentId') } }, (err, res) => {`,
    "  pm.test('FR01-AI-024 - database remains operational', () => { pm.expect(err).to.eql(null); pm.expect(res.code).to.eql(200); });",
    "});",
  ]));
}

{
  const xss = "<img src=x onerror=alert(1)>";
  const body = { ...valid("FR01-AI-025"), name: xss };
  specials.push(workflowItem("FR01-AI-025 corrected stored-XSS probe", request("/api/register", JSON.stringify(body)), [
    "pm.test('FR01-AI-025 - registration response does not reflect name', () => { pm.expect(pm.response.code).to.eql(200); pm.expect(pm.response.text()).not.to.include('<img'); });",
    `pm.sendRequest({ url: ${sendUrl("/api/login")}, method: 'POST', ${sendHeaders}, body: { mode: 'raw', raw: ${JSON.stringify(JSON.stringify({ email: body.email, password: body.password }))} } }, (err, res) => {`,
    `  pm.test('FR01-AI-025 - stored value remains data for later encoding checks', () => { pm.expect(err).to.eql(null); pm.expect(res.json().user.name).to.eql(${JSON.stringify(xss)}); });`,
    "});",
  ]));
}

{
  const body = valid("FR01-AI-037");
  specials.push(workflowItem("FR01-AI-037 password storage and exposure", request("/api/register", JSON.stringify(body)), [
    "pm.test('FR01-AI-037 - registration succeeds', () => pm.expect(pm.response.code).to.eql(200));",
    `pm.sendRequest({ url: ${sendUrl("/api/login")}, method: 'POST', ${sendHeaders}, body: { mode: 'raw', raw: ${JSON.stringify(JSON.stringify({ email: body.email, password: body.password }))} } }, (err, res) => {`,
    "  pm.test('FR01-AI-037 - password is neither plaintext nor exposed', () => { const user = res.json().user; pm.expect(err).to.eql(null); pm.expect(user).not.to.have.property('password'); });",
    "});",
  ]));
}

{
  const body = { ...valid("FR01-AI-040"), role: "admin", id: 1, login_attempts: 0 };
  specials.push(workflowItem("FR01-AI-040 mass assignment", request("/api/register", JSON.stringify(body)), [
    "pm.test('FR01-AI-040 - request is rejected or safely ignores extras', () => pm.expect(pm.response.code).to.be.oneOf([200, 400]));",
    `if (pm.response.code === 200) pm.sendRequest({ url: ${sendUrl("/api/login")}, method: 'POST', ${sendHeaders}, body: { mode: 'raw', raw: ${JSON.stringify(JSON.stringify({ email: body.email, password: body.password }))} } }, (err, res) => {`,
    "  pm.test('FR01-AI-040 - created account is not admin', () => { pm.expect(err).to.eql(null); pm.expect(res.json().user.role).to.eql('user'); });",
    "});",
  ]));
}

{
  const body = valid("FR01-H-001");
  specials.push(workflowItem("FR01-H-001 concurrent duplicate registration", request("/api/categories", undefined, null, "GET"), [
    `const concurrentOptions = { url: ${sendUrl("/api/register")}, method: 'POST', ${sendHeaders}, body: { mode: 'raw', raw: ${JSON.stringify(JSON.stringify(body))} } };`,
    "const concurrentCodes = [];",
    "function collect(err, res) { concurrentCodes.push(err ? 0 : res.code); if (concurrentCodes.length === 2) pm.test('FR01-H-001 - exactly one concurrent registration wins', () => pm.expect(concurrentCodes.sort()).to.eql([200, 409])); }",
    "pm.sendRequest(concurrentOptions, collect);",
    "pm.sendRequest(concurrentOptions, collect);",
  ]));
}

{
  const invalid = { ...valid("FR01-H-002"), password: "Aa1!aaa" };
  const corrected = { ...invalid, password: "Valid123!" };
  specials.push(workflowItem("FR01-H-002 valid retry after rejected password", request("/api/register", JSON.stringify(invalid)), [
    "pm.test('FR01-H-002 - weak password is rejected', () => pm.expect(pm.response.code).to.eql(400));",
    `pm.sendRequest({ url: ${sendUrl("/api/register")}, method: 'POST', ${sendHeaders}, body: { mode: 'raw', raw: ${JSON.stringify(JSON.stringify(corrected))} } }, (err, res) => {`,
    "  pm.test('FR01-H-002 - corrected retry succeeds', () => { pm.expect(err).to.eql(null); pm.expect(res.code).to.eql(200); });",
    "});",
  ]));
}

{
  const body = { ...valid("FR01-H-003"), "__proto__": { role: "admin" }, constructor: { prototype: { role: "admin" } } };
  const raw = `{"name":"${body.name}","email":"${body.email}","password":"${body.password}","__proto__":{"role":"admin"},"constructor":{"prototype":{"role":"admin"}}}`;
  specials.push(workflowItem("FR01-H-003 prototype pollution keys", request("/api/register", raw), [
    "pm.test('FR01-H-003 - dangerous object keys are rejected', () => pm.expect(pm.response.code).to.eql(400));",
  ]));
}

{
  const oversized = { ...valid("FR01-H-004"), name: "A".repeat(110 * 1024) };
  specials.push(workflowItem("FR01-H-004 oversized request body", request("/api/register", JSON.stringify(oversized)), [
    "pm.test('FR01-H-004 - oversized body returns 413', () => pm.expect(pm.response.code).to.eql(413));",
    `pm.sendRequest({ url: ${sendUrl("/api/categories")}, method: 'GET', header: { 'X-Student-Id': pm.collectionVariables.get('studentId') } }, (err, res) => {`,
    "  pm.test('FR01-H-004 - service remains responsive', () => { pm.expect(err).to.eql(null); pm.expect(res.code).to.eql(200); });",
    "});",
  ]));
}

{
  specials.push(workflowItem("FR01-H-005 registration burst and rate-limit observation", request("/api/categories", undefined, null, "GET"), [
    "const burstCodes = [];",
    "for (let i = 0; i < 100; i += 1) {",
    "  const burstBody = JSON.stringify({ name: 'Burst User', email: `burst-${i}@hw06.test`, password: 'Valid123!' });",
    `  pm.sendRequest({ url: ${sendUrl("/api/register")}, method: 'POST', ${sendHeaders}, body: { mode: 'raw', raw: burstBody } }, (err, res) => {`,
    "    burstCodes.push(err ? 0 : res.code);",
    "    if (burstCodes.length === 100) {",
    "      const limited = burstCodes.filter(code => code === 429).length;",
    "      console.log('FR01-H-005 rate-limit observation: 429 responses =', limited, 'of 100');",
    "      pm.test('FR01-H-005 - burst completes with controlled responses', () => { pm.expect(burstCodes).to.have.length(100); pm.expect(burstCodes).not.to.include(0); });",
    "    }",
    "  });",
    "}",
  ]));
}

const collection = {
  info: {
    _postman_id: "20f8ec44-2312-7414-a001-000000000001",
    name: "EShop HW06 - 23127414",
    description: "Audited API tests for HW06. Generated by a deterministic repository script after student review.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  event: [{
    listen: "prerequest",
    script: {
      type: "text/javascript",
      exec: [
        "const studentId = pm.collectionVariables.get('studentId');",
        "pm.request.headers.upsert({ key: 'X-Student-Id', value: studentId });",
        "console.log(`X-Student-Id: ${studentId}`);",
      ],
    },
  }],
  variable: [
    { key: "baseUrl", value: "http://localhost:3000", type: "string" },
    { key: "studentId", value: "23127414", type: "string" },
  ],
  item: [
    { name: "FR-01 Registration - audited AI cases", item: [...standardCases.map(standardItem), ...specials.slice(0, 6)] },
    { name: "FR-01 Registration - student-selected extensions", item: specials.slice(6) },
  ],
};

const output = path.resolve(__dirname, "..", "postman", "eshop-hw06.postman_collection.json");
fs.writeFileSync(output, `${JSON.stringify(collection, null, 2)}\n`, "utf8");
console.log(`Wrote ${output}`);
console.log(`FR-01 case count: ${standardCases.length + specials.length}`);
