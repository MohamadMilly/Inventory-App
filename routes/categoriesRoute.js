const express = require("express");
const { body } = require("express-validator");
const categoriesController = require("../controllers/categoriesController");
const categoriesRouter = express.Router();
const db = require("../db/queries");
const emptyCategoryError = "Category should not be empty";
const isAlphaCategoryError = "Category should only contain letters";
const categoryAlreadyExistsError = "Category already exists";
const validateCategory = [
  body("newCategory")
    .trim()
    .notEmpty()
    .withMessage(emptyCategoryError)
    .isAlpha()
    .withMessage(isAlphaCategoryError)
    .custom(async (value) => {
      const categories = (await db.getCategories()).map((categoryObj) =>
        categoryObj.category.toLowerCase()
      );
      const doesCategoryExists = categories.includes(value.toLowerCase());
      if (doesCategoryExists) {
        throw new Error(categoryAlreadyExistsError);
      }
    }),
];

categoriesRouter.get("/add", categoriesController.addCategoryGet);
categoriesRouter.get("/{:category}", categoriesController.allItemsGet);

categoriesRouter.post(
  "/:categoryId/delete",
  categoriesController.deleteCategoryPost
);

categoriesRouter.post(
  "/add",
  validateCategory,
  categoriesController.addCategoryPost
);
module.exports = categoriesRouter;
