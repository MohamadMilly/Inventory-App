const { Pool } = require("pg");
const fs = require("fs");
require("dotenv").config();

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: fs.readFileSync("./ca.pem").toString(),
    rejectUnauthorized: true
  },
});
