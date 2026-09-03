const fs = require("fs");
const path = require("path");

const backend = process.env.ESHOP_SUT_BACKEND
  ? path.resolve(process.env.ESHOP_SUT_BACKEND)
  : path.resolve(__dirname, "..", "..", "eshop-sut", "backend");

if (!fs.existsSync(path.join(backend, "database.sqlite"))) {
  throw new Error(
    `EShop backend database not found at ${backend}. `
    + "Set ESHOP_SUT_BACKEND to the checked-out SUT backend directory.",
  );
}

module.exports = backend;
