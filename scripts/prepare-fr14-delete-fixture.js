const path = require("path");
const backend = require("./sut-backend");
const sqlite3 = require(path.join(backend, "node_modules", "sqlite3")).verbose();
const db = new sqlite3.Database(path.join(backend, "database.sqlite"));
const mode = process.argv[2] || "main";
const run = (sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function callback(error) {
  if (error) reject(error); else resolve({ changes: this.changes, lastID: this.lastID });
}));

async function main() {
  if (!new Set(["single", "main"]).has(mode)) throw new Error(`Unknown DELETE fixture mode: ${mode}`);
  await run("BEGIN TRANSACTION");
  try {
    await run("DELETE FROM products");
    await run("DELETE FROM categories");
    await run("DELETE FROM sqlite_sequence WHERE name IN ('products','categories')");
    const count = mode === "single" ? 1 : 80;
    for (let id = 1; id <= count; id += 1) {
      const name = mode === "main" && (id === 6 || id === 60) ? "FR14-DELETE-DUPLICATE" : `FR14-DELETE-${String(id).padStart(3, "0")}`;
      await run("INSERT INTO categories (id, name) VALUES (?, ?)", [id, name]);
    }
    if (mode === "main") {
      await run("INSERT INTO products (id,name,price,description,imageUrl,category_id) VALUES (1,'FR14-REF-31',1,'reference-31','x',31)");
      await run("INSERT INTO products (id,name,price,description,imageUrl,category_id) VALUES (2,'FR14-REF-70',2,'reference-70','y',70)");
    }
    await run("COMMIT");
    console.log(`FR-14 DELETE fixture '${mode}' prepared with ${count} categories.`);
  } catch (error) { await run("ROLLBACK"); throw error; }
}
main().then(() => db.close()).catch((error) => { console.error(error); db.close(); process.exitCode = 1; });
