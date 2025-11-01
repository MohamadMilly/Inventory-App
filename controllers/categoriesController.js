const { validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");

async function allItemsGet(req, res) {
  const links = await db.getCategories();
  if (req.params.category) {
    const { category } = req.params;
    const itemsByCategory = await db.getAllItemsByCategory(category);
    res.render("category", {
      title: `All ${category}`,
      items: itemsByCategory,
      links: links,
    });
  } else {
    const items = await db.getAllItems();
    res.render("category", {
      title: "All Items",
      items: items,
      links: links,
    });
  }
}

async function deleteCategoryPost(req, res) {
  const { categoryId } = req.params;
  await db.deleteCategory(categoryId);
  res.redirect("/");
}
async function addCategoryGet(req, res) {
  res.render("addcategory", { title: "New category" });
}
async function addCategoryPost(req, res) {
  const errors = validationResult(req);
  const referrer = req.get("Referer");
  if (!errors.isEmpty()) {
    return res.render(addCategoryPath, {
      title: "New category",
      errors: errors.array(),
    });
  }
  const { newCategory } = matchedData(req);
  await db.addCategory(newCategory);

  if (referrer) {
    return res.redirect(referrer);
  } else {
    return res.redirect("/");
  }
}
module.exports = {
  allItemsGet,
  deleteCategoryPost,
  addCategoryGet,
  addCategoryPost,
};
