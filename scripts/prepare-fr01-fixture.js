const path = require("path");
const backend = require("./sut-backend");

const sqlite3 = require(path.join(backend, "node_modules", "sqlite3")).verbose();
const db = new sqlite3.Database(path.join(backend, "database.sqlite"));
const run = (sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function callback(error) {
  if (error) reject(error); else resolve({ changes: this.changes, lastID: this.lastID });
}));

async function main() {
  await run("DELETE FROM orders");
  await run("DELETE FROM users WHERE id > 2");
  await run("UPDATE sqlite_sequence SET seq = 2 WHERE name = 'users'");
  console.log("FR-01 fixture prepared: seeded users retained and generated registrations removed.");
}

main().then(() => db.close()).catch((error) => {
  console.error(error);
  db.close();
  process.exitCode = 1;
});
