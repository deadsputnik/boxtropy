const db = require("../db/queries");
const {
  body,
  param,
  validationResult,
  matchedData,
} = require("express-validator");

const EMPTY_VALUES = ["", null, undefined, 0, "0"];

const toNullableId = (value) => {
  if (EMPTY_VALUES.includes(value)) return null;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
};

const containerValidation = [
  body("contName").trim(),
  body("contLocation").trim().customSanitizer(toNullableId),
  body("contContainer").trim().customSanitizer(toNullableId),
  body("contNote").trim().isAlpha(),
];

const postNewContainer = [
  containerValidation,
  async (req, res) => {
    // ADD - check for duplicate names before submit...
    const { contName, contLocation, contContainer, contNote } =
      matchedData(req);
    await db.addContainer(
      contName,
      contLocation,
      contContainer,
      "containers/container-5.jpg",
      contNote,
    );
    res.redirect("/");
  },
];

const containerUpdateValidator = [
  body("contName").trim(),
  body("contLocation").trim().customSanitizer(toNullableId),
  body("contContainer").trim().customSanitizer(toNullableId),
  body("contNote").trim(),
  param("containerId").trim(),
];

const postUpdateContainer = [
  containerUpdateValidator,
  async (req, res) => {
    const { contName, contLocation, contContainer, contNote, containerId } =
      matchedData(req);
    await db.updateContainer(
      containerId,
      contName,
      contLocation,
      contContainer,
      "containers/container-1.jpg",
      contNote,
    );
    res.redirect(`/container/${containerId}`);
  },
];

const containerIdValidator = [body("containerId").trim().toInt()];

const postDeleteContainer = [
  containerIdValidator,
  async (req, res) => {
    const { containerId } = matchedData(req);
    console.log("Deleting container", containerId);
    await db.postDeleteContainer(containerId);
    res.redirect("/");
  },
];

module.exports = { postNewContainer, postUpdateContainer, postDeleteContainer };
