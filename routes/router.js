const { Router } = require("express");
const router = Router();
const controller = require("../controllers/controller");
const categoryController = require("../controllers/categoryController");
const postController = require("../controllers/postController");

router.get("/", containerController.getHome);
router.get("/containers", containerController.getContainers);
router.get("/containers/:containerId", containerController.getContainer);
router.get("/new-container", containerController.newContainer);
router.post("/containers", containerController.createContainer);
router.get("/containers/:containerId", containerController.editContainer);
router.patch("/containers/:containerId", containerController.updateContainer);
router.delete("/containers/:containerId", containerController.deleteContainer);

router.get("/items", itemController.getItems);
router.get("/new-item", itemController.newItem);
router.post("/items", itemController.createItem);
router.get("/items/:itemId", itemController.editItem);
router.patch("/items/:itemId", itemController.updateItem);
router.delete("/items/:itemId", itemController.deleteItem);
router.get("/items/unsorted", itemController.getUnsorted);

router.get("/locations", locationController.getLocations);
router.get("/locations/:locationId", locationController.getLocation);
router.get("/new-location", locationController.newLocation);
router.port("/locations", locationController.createLocation);
router.get("/locations/:locationId", locationController.editLocation);
router.patch("/locations/:locationId", locationController.updateLocation);

router.get("/categories", categoryController.getCategories);
router.get("/categories/:categoryId", categoryController.getCategory);
router.get("/new-category", categoryController.newCategory);
router.post("/categories", categoryController.createCategory);
router.get("categories/:categoryId", categoryController.editCategory);
router.patch("categories/:categoryId", categoryController.updateCategory);
router.delete("/categories/:categoryId", postController.postDeleteContainer);

module.exports = router;
