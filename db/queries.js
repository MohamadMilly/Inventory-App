const pool = require("./pool");

async function getAllItems() {
  const { rows: itemsWithCategories } = await pool.query(
    `SELECT items.id , name , price , quantity , array_agg(category) AS categories
    FROM items
    JOIN relation ON items.id = relation.item_id
    JOIN categories ON categories.id = relation.category_id
    GROUP BY items.id , items.name
    ;`
  );

  const { rows: itemsWithOutCategories } = await pool.query(
    "SELECT * FROM items WHERE id NOT IN (SELECT item_id FROM relation);"
  );

  return [...itemsWithCategories, ...itemsWithOutCategories];
}

async function getAllItemsByCategory(category) {
  const { rows: items } = await pool.query(
    `
    SELECT items.id , name , price , quantity , array_agg(category) AS categories
    FROM items
    JOIN relation ON items.id = relation.item_id
    JOIN categories ON categories.id = relation.category_id
    GROUP BY items.id , items.name
    HAVING $1 = ANY(array_agg(categories.category));
  `,
    [category]
  );
  return items;
}

async function getItem(id) {
  const doesItemHaveCategory =
    (await pool.query("SELECT item_id FROM relation WHERE item_id = $1", [id]))
      .rows.length !== 0;

  if (!doesItemHaveCategory) {
    const { rows: itemWithoutCategory } = await pool.query(
      "SELECT * FROM items WHERE id = $1",
      [id]
    );
    return { ...itemWithoutCategory[0], categories: [] };
  } else {
    const { rows: itemWithCategory } = await pool.query(
      `
    SELECT items.id , name , price , quantity , array_agg(category) AS categories
    FROM items
    JOIN relation ON items.id = relation.item_id
    JOIN categories ON categories.id = relation.category_id
    GROUP BY items.id , items.name
    HAVING items.id = $1
  ;`,
      [id]
    );
    return itemWithCategory[0];
  }
}

async function getCategories() {
  const { rows: categories } = await pool.query("SELECT * FROM categories");
  return categories;
}

async function addItem(name, price, quantity, categories) {
  const newItem = await pool.query(
    `
  INSERT INTO items(name,price,quantity) VALUES ($1,$2,$3) RETURNING id;
  `,
    [name, price, quantity]
  );

  const insertedId = newItem.rows[0].id;
  categories.map(async (category) => {
    const doesCategoryExist =
      (
        await pool.query(
          "SELECT category FROM categories WHERE category = $1",
          [category]
        )
      ).rows.length !== 0;
    if (!doesCategoryExist) {
      await pool.query("INSERT INTO categories(category) VALUES ($1)", [
        category,
      ]);
    }
    const categoryId = (
      await pool.query("SELECT id FROM categories WHERE category = $1", [
        category,
      ])
    ).rows[0].id;
    await pool.query(
      "INSERT INTO relation(item_id,category_id) VALUES ($1,$2)",
      [insertedId, categoryId]
    );
  });
}

async function addCategory(category) {
  await pool.query("INSERT INTO categories(category) VALUES ($1)", [category]);
}

async function updateItem(id, name, price, quantity, categories) {
  await pool.query(
    `UPDATE items
     SET name = $1,
     price =  $2,
     quantity = $3 WHERE id = $4
    `,
    [name, price, quantity, id]
  );
  /* reset the relations of the item to add the new one */
  await pool.query("DELETE FROM relation WHERE item_id  = $1", [id]);
  categories.map(async (category) => {
    const doesCategoryExist =
      (
        await pool.query(
          "SELECT category FROM categories WHERE category = $1",
          [category]
        )
      ).rows.length !== 0;
    if (!doesCategoryExist) {
      await pool.query("INSERT INTO categories (category) VALUES ($1)", [
        category,
      ]);
    }

    const categoryId = (
      await pool.query("SELECT id FROM categories WHERE category = $1", [
        category,
      ])
    ).rows[0].id;

    await pool.query(
      "INSERT INTO relation(item_id,category_id) VALUES ($1,$2)",
      [id, categoryId]
    );
  });
}

async function deleteItem(id) {
  await pool.query("DELETE FROM relation WHERE item_id = $1", [id]);
  await pool.query("DELETE FROM items WHERE id = $1", [id]);
}

async function deleteCategory(id) {
  await pool.query("DELETE FROM relation WHERE category_id = $1", [id]);
  await pool.query("DELETE FROM categories WHERE id = $1", [id]);
}

module.exports = {
  getAllItems,
  getAllItemsByCategory,
  getCategories,
  getItem,
  addItem,
  addCategory,
  updateItem,
  deleteItem,
  deleteCategory,
};
