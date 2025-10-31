const express = require("express");
const itemsController = require("../controllers/itemsController");
const { body } = require("express-validator");
const db = require("../db/queries");
const itemsRouter = express.Router();

const emptyItemNameError = "Item's name should not be empty";
const itemAlreadyExistsError = "Item already exists";
const priceRequiredError = "Price is required";
const priceIntegerError = "Price should be an integer";
const quantityRequiredError = "Quantity is required";
const quantityIntegerError = "Quantity should be an integer";

const validateItem = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(emptyItemNameError)
    .custom(async (value, { req }) => {
      // if the request is an update POST request don't stop validating
      if (req.path.includes("update")) return;
      const items = await db.getAllItems();
      const doesItemExist = items.some(
        (item) => item.name.toLowerCase() === value.toLowerCase()
      );
      if (doesItemExist) {
        throw new Error(itemAlreadyExistsError);
      }
    }),
  body("price")
    .trim()
    .notEmpty()
    .withMessage(priceRequiredError)
    .isInt({ min: 1 })
    .withMessage(priceIntegerError),
  body("quantity")
    .trim()
    .notEmpty()
    .withMessage(quantityRequiredError)
    .isInt({ min: 1 })
    .withMessage(quantityIntegerError),
];

itemsRouter.get("/add", itemsController.addItemGet);
itemsRouter.get("/:itemId/update", itemsController.updateItemGet);

itemsRouter.post("/add", validateItem, itemsController.addItemPost);
itemsRouter.post(
  "/:itemId/update",
  validateItem,
  itemsController.updateItemPost
);
itemsRouter.post("/:itemId/delete", itemsController.deleteItemPost);

module.exports = itemsRouter;
