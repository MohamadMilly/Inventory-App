const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, "../ca.pem")).toString(),
  },
});
