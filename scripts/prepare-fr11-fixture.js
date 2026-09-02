const path = require("path");

const backend = path.resolve(__dirname, "..", "..", "eshop-sut", "backend");
const sqlite3 = require(path.join(backend, "node_modules", "sqlite3")).verbose();
const databasePath = path.join(backend, "database.sqlite");
const db = new sqlite3.Database(databasePath);

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function callback(error) {
    if (error) reject(error);
    else resolve({ lastID: this.lastID, changes: this.changes });
  });
});

async function main() {
  await run("DELETE FROM orders");
  await run("DELETE FROM users WHERE id > 2");
  await run("DELETE FROM sqlite_sequence WHERE name IN ('orders', 'users')");

  const users = [
    [3, "One Order User", "fr11-one@hw06.test", "Pass123!"],
    [4, "Empty User", "fr11-empty@hw06.test", "Pass123!"],
    [5, "Three Order User", "fr11-three@hw06.test", "Pass123!"],
    [6, "Large History A", "fr11-large-a@hw06.test", "Pass123!"],
    [7, "Sentinel User B", "fr11-large-b@hw06.test", "Pass123!"],
    [8, "Race User", "fr11-race@hw06.test", "Pass123!"],
  ];
  for (const [id, name, email, password] of users) {
    await run("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'user')", [id, name, email, password]);
  }

  const insertOrder = (userId, total, status, address, createdAt) => run(
    "INSERT INTO orders (user_id, total_amount, status, shipping_address, created_at) VALUES (?, ?, ?, ?, ?)",
    [userId, total, status, address, createdAt],
  );

  await insertOrder(3, 111111, "pending", "Địa chỉ một đơn", "2026-01-01T01:00:00.000Z");
  await insertOrder(5, 100000, "pending", "Three-1", "2026-01-01T01:00:00.000Z");
  await insertOrder(5, 200000, "confirmed", "Three-2", "2026-01-02T01:00:00.000Z");
  await insertOrder(5, 300000, "shipping", "Three-3", "2026-01-03T01:00:00.000Z");

  const statusRows = [
    [0, "pending", "Hà Nội"],
    [1, "confirmed", "Đà Nẵng"],
    [Number.MAX_SAFE_INTEGER, "shipping", "Huế"],
    [400000, "delivered", "TP. Hồ Chí Minh"],
    [500000, "canceled", "Cần Thơ"],
  ];
  for (let index = 0; index < statusRows.length; index += 1) {
    const [total, status, address] = statusRows[index];
    await insertOrder(2, total, status, address, `2026-02-0${index + 1}T01:00:00.000Z`);
  }

  for (let index = 0; index < 1000; index += 1) {
    await insertOrder(6, index + 1, "pending", `Large-A-${index}`, new Date(Date.UTC(2026, 2, 1, 0, 0, index)).toISOString());
  }
  await insertOrder(7, 987654321, "delivered", "FOREIGN-SENTINEL-ORDER", "2026-04-01T00:00:00.000Z");
  await insertOrder(8, 810001, "pending", "Race-1", "2026-05-01T00:00:00.000Z");
  await insertOrder(8, 810002, "confirmed", "Race-2", "2026-05-02T00:00:00.000Z");

  console.log("FR-11 fixture prepared: users 1-8, deterministic personal histories, 1000-order large dataset, and foreign sentinel.");
}

main()
  .then(() => db.close())
  .catch((error) => {
    console.error(error);
    db.close();
    process.exitCode = 1;
  });
