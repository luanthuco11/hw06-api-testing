const path = require("path");

const backend = require("./sut-backend");
const sqlite3 = require(path.join(backend, "node_modules", "sqlite3")).verbose();
const databasePath = path.join(backend, "database.sqlite");
const mode = process.argv[2] || "main";
const db = new sqlite3.Database(databasePath);

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function callback(error) {
    if (error) reject(error);
    else resolve({ lastID: this.lastID, changes: this.changes });
  });
});

const fixtures = {
  default: ["Điện thoại", "Laptop", "Phụ kiện"],
  empty: [],
  one: ["FR14-ONE-SENTINEL"],
  hundred: Array.from({ length: 100 }, (_, index) => `FR14-HUNDRED-${String(index + 1).padStart(3, "0")}`),
  main: [
    "FR14-VALID-SENTINEL",
    "Điện thoại",
    "Cà phê sữa đá",
    "Z",
    "a".repeat(255),
    "b".repeat(256),
    "FR14-DUPLICATE",
    "FR14-DUPLICATE",
    "",
    null,
    "<script>alert(1)</script>",
    "x' OR 1=1 --",
    "safe\r\nX-HW06-Injected: yes\t\"\\",
  ],
  large: Array.from({ length: 10000 }, (_, index) => {
    if (index === 0) return "FR14-LARGE-FIRST-SENTINEL";
    if (index === 4999) return "FR14-LARGE-MIDDLE-SENTINEL";
    if (index === 9999) return "FR14-LARGE-LAST-SENTINEL";
    return `FR14-LARGE-${String(index + 1).padStart(5, "0")}`;
  }),
};

async function main() {
  if (!Object.hasOwn(fixtures, mode)) {
    throw new Error(`Unknown FR-14 GET fixture mode: ${mode}`);
  }

  await run("BEGIN TRANSACTION");
  try {
    await run("DELETE FROM categories");
    await run("DELETE FROM sqlite_sequence WHERE name = 'categories'");
    for (const name of fixtures[mode]) {
      await run("INSERT INTO categories (name) VALUES (?)", [name]);
    }
    await run("COMMIT");
  } catch (error) {
    await run("ROLLBACK");
    throw error;
  }

  console.log(`FR-14 GET fixture '${mode}' prepared with ${fixtures[mode].length} categories.`);
}

main()
  .then(() => db.close())
  .catch((error) => {
    console.error(error);
    db.close();
    process.exitCode = 1;
  });
