const db = require("../db/queries");
const { param, validationResult, matchedData } = require("express-validator");

const validateLocationId = [param("locationId").trim().isInt()];
const validateContainerId = [param("containerId").trim().isInt()];

async function getHome(req, res) {
  const containers = await db.getAllContainers();
  res.render("home", { containers: containers, button: null });
}

async function getContainers(req, res) {
  const containers = await db.getAllParentContainers();
  res.render("containers", { containers: containers, button: "containers" });
}

async function getItems(req, res) {
  const items = await db.getAllItems();
  res.render("items", { items: items, menu: "items" });
}
async function getLocations(req, res) {
  const locations = await db.getAllLocations();
  res.render("locations", { locations });
}

const getContainersInLocation = [
  validateLocationId,
  async (req, res) => {
    const { locationId } = matchedData(req);
    const containers = await db.getContainersByLocationId(locationId);
    const locationName = containers[0].locationName;
    res.render("containersIn", {
      containers: containers,
      button: null,
      title: `Location - ${locationName}`,
    });
  },
];

const getItemsInContainer = [
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

async function getUnsorted(req, res) {
  const items = await db.getUnorganizedItems();
  res.render("items", { items: items, menu: "unsorted" });
}

async function getNewContainer(req, res) {
  // ADD - check for duplicate names before submit...
  const existingContainers = await db.getAllContainers();
  const existingLocations = await db.getAllLocations();
  res.render("newContainer", {
    containers: existingContainers,
    locations: existingLocations,
  });
}

const getUpdateContainer = [
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

async function getNewItemForm(req, res) {
  const existingContainers = await db.getAllContainers();
  const existingCategories = await db.getAllCategories();
  res.render("addItem", {
    containers: existingContainers,
    categories: existingCategories,
  });
}

module.exports = {
  getHome,
  getContainers,
  getItems,
  getLocations,
  getContainersInLocation,
  getItemsInContainer,
  getUnsorted,
  getNewContainer,
  getUpdateContainer,
  getNewItemForm,
};
