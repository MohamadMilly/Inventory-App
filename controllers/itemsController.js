const db = require("../db/queries");
const { validationResult, matchedData } = require("express-validator");
async function addItemGet(req, res) {
  const categories = (await db.getCategories()).map(
    (categoryObj) => categoryObj.category
  );
  res.render("addItemForm", { title: "New Item", categories: categories });
}

async function addItemPost(req, res) {
  const errors = validationResult(req);
  const globalCategories = (await db.getCategories()).map(
    (categoryObj) => categoryObj.category
  );
  if (!errors.isEmpty()) {
    return res.render("addItemForm", {
      title: "New Item",
      categories: globalCategories,
      errors: errors.array(),
    });
  }
  const { name, price, quantity, categories } = matchedData(req);
  await db.addItem(name, price, quantity, categories);
  res.redirect("/");
}

async function updateItemGet(req, res) {
  const { itemId } = req.params;
  const categories = (await db.getCategories()).map(
    (categoryObj) => categoryObj.category
  );
  const item = await db.getItem(itemId);
  res.render("updateItemForm", {
    title: "Update Item",
    item: item,
    categories: categories,
  });
}

async function updateItemPost(req, res) {
  const errors = validationResult(req);
  const { itemId } = req.params;
  const globalCategories = (await db.getCategories()).map(
    (categoryObj) => categoryObj.category
  );
  const item = await db.getItem(itemId);
  if (!errors.isEmpty()) {
    return res.render("updateItemForm", {
      title: "Update Item",
      item: item,
      categories: globalCategories,
      errors: errors.array(),
    });
  }
  const { name, price, quantity, categories } = matchedData(req);

  await db.updateItem(
    itemId,
    name,
    price,
    quantity,
    categories ? categories : []
  );
  res.redirect("/");
}

async function deleteItemPost(req, res) {
  const { itemId } = req.params;
  await db.deleteItem(itemId);
  res.redirect("/");
}

module.exports = {
  addItemGet,
  addItemPost,
  updateItemGet,
  updateItemPost,
  deleteItemPost,
};
