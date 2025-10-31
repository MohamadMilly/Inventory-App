const express = require("express");
const path = require("node:path");
const itemsRouter = require("./routes/itemsRoute");
const categoriesRouter = require("./routes/categoriesRoute");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use("/items", itemsRouter);
app.use("/{categories}", categoriesRouter);

app.listen(PORT, (error) => {
  console.error(error);
});
