const randomColor = require("randomcolor");
const db = require("../db/queries");
const {
  body,
  query,
  param,
  validationResult,
  matchedData,
} = require("express-validator");

const validateCategory = [
  body("category")
    .trim()
    .isAlphanumeric()
    .withMessage("Category name must be Alphanumeric"),
  body("color")
    .trim()
    .isHexColor()
    .withMessage("Color must be Hex ie(#ffffff)"),
];

const validateCategoryId = [param("categoryId").trim().isInt()];

async function getCategories(req, res) {
  const categories = await db.getAllCategories();
  console.log(categories);
  res.render("categories", { categories });
}

const getItemsInCategory = [
  validateCategoryId,
  async (req, res) => {
    const { categoryId } = matchedData(req);
    const items = await db.getItemsByCategoryId(categoryId);
    res.render("items", { items: items, menu: null });
  },
];

async function postCategory(req, res) {
  const colorArray = [
    "red",
    "blueviolet",
    "deepskyblue",
    "black",
    "green",
    "grey",
    "yellow",
    "orange",
    "brown",
  ];

  //get data from user
  // move this to category controller
  // populate object

  const countResult = await db.getCountCategories();
  const categoryCount = countResult[0].count;
  let color = randomColor({ luminosity: "light" });
  if (categoryCount > 10) {
    color = colorArr[categoryCount - 1];
  }
  await db.postCategory(category, color);
  res.redirect("/categories");
}

module.exports = { getCategories, getItemsInCategory, postCategory };
