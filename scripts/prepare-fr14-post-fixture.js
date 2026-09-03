const path = require("path");

const backend = require("./sut-backend");
const sqlite3 = require(path.join(backend, "node_modules", "sqlite3")).verbose();
const databasePath = path.join(backend, "database.sqlite");
const db = new sqlite3.Database(databasePath);

db.serialize(() => {
  db.run("DELETE FROM categories");
  db.run("DELETE FROM sqlite_sequence WHERE name = 'categories'", (error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    } else {
      console.log("FR-14 POST fixture prepared: empty category table with deterministic IDs.");
    }
    db.close();
  });
});
