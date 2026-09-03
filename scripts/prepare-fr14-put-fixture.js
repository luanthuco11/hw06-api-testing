const path = require("path");

const backend = require("./sut-backend");
const sqlite3 = require(path.join(backend, "node_modules", "sqlite3")).verbose();
const db = new sqlite3.Database(path.join(backend, "database.sqlite"));
const run = (sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function callback(error) {
  if (error) reject(error); else resolve({ lastID: this.lastID, changes: this.changes });
}));

async function main() {
  await run("BEGIN TRANSACTION");
  try {
    await run("DELETE FROM products");
    await run("DELETE FROM categories");
    await run("DELETE FROM sqlite_sequence WHERE name IN ('products','categories')");
    for (let id = 1; id <= 48; id += 1) {
      const name = id === 48 ? "FR14-DUPLICATE-TARGET" : `FR14-ORIGINAL-${String(id).padStart(3, "0")}`;
      await run("INSERT INTO categories (id, name) VALUES (?, ?)", [id, name]);
    }
    await run("INSERT INTO products (id, name, price, description, imageUrl, category_id) VALUES (1, ?, 12345, ?, ?, 47)", ["FR14-PRODUCT-SENTINEL", "unchanged-description", "https://example.test/sentinel.png"]);
    await run("COMMIT");
    console.log("FR-14 PUT fixture prepared: 48 isolated categories and one product sentinel referencing category 47.");
  } catch (error) {
    await run("ROLLBACK");
    throw error;
  }
}

main().then(() => db.close()).catch((error) => { console.error(error); db.close(); process.exitCode = 1; });
