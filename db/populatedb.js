const { Client } = require("pg");
require("dotenv").config();

const ITEMS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
name TEXT NOT NULL,
price INTEGER,
quantity INTEGER DEFAULT 0
);
`;

const CATEGORIES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
category TEXT NOT NULL
);
`;

const RELATION_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS relation (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  item_id INTEGER REFERENCES items(id),
  category_id INTEGER REFERENCES categories(id)
);
`;

async function main() {
  console.log("seeding ...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  await client.query(ITEMS_TABLE_SQL);
  await client.query(CATEGORIES_TABLE_SQL);
  await client.query(RELATION_TABLE_SQL);
  await client.end();

  console.log("Done !");
}

main();
