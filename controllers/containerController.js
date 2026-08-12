const db = require("../db/queries");
const { param, validationResult, matchedData } = require("express-validator");

async function getContainers(req, res) {
  const containers = await db.getAllParentContainers();
  res.render("containers", { containers: containers, button: "containers" });
}

const getContainer = [
  validateContainerId,
  ,
  async (req, res) => {
    const { containerId } = matchedData(req);
    const containerResult = await db.getContainer(containerId);
    const container = containerResult[0];
    const result = await db.getContainersInsideContainer(containerId);
    const containers = result[0].arr;

    let items;
    if (containers) {
      containers.unshift(parseInt(containerId));
      items = await db.getItemsInContainer(containers);
    } else {
      items = await db.getItemsInContainer([containerId]);
    }

    res.render("container", {
      items: items,
      menu: null,
      container: container,
      title: `Container - ${container.name}`,
    });
  },
];

async function newContainer(req, res) {
  // ADD - check for duplicate names before submit...
  const existingContainers = await db.getAllContainers();
  const existingLocations = await db.getAllLocations();
  res.render("newContainer", {
    containers: existingContainers,
    locations: existingLocations,
  });
}

const containerValidation = [
  body("contName").trim(),
  body("contLocation").trim().customSanitizer(toNullableId),
  body("contContainer").trim().customSanitizer(toNullableId),
  body("contNote").trim().isAlpha(),
];

const createContainer = [
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

const updateContainer = [
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

const deleteContainer = [
  containerIdValidator,
  async (req, res) => {
    const { containerId } = matchedData(req);
    console.log("Deleting container", containerId);
    await db.postDeleteContainer(containerId);
    res.redirect("/");
  },
];

const editContainer = [
  validateContainerId,
  async (req, res) => {
    const existingContainers = await db.getAllContainers();
    const existingLocations = await db.getAllLocations();
    const { containerId } = matchedData(req);
    const container = await db.getContainer(containerId);
    res.render("updateContainer", {
      container: container[0],
      existingContainers: existingContainers,
      existingLocations: existingLocations,
    });
  },
];

module.exports = {
  getContainers,
  getContainer,
  newContainer,
  createContainer,
  editContainer,
  updateContainer,
  deleteContainer,
};
