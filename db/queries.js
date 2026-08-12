const { json } = require("express");
const pool = require("./pool");

async function getAllContainers() {
  const { rows } = await pool.query(
    "SELECT cont.*, l.name AS locationName, COUNT(i.id) as itemCount, COUNT(cont2.id) as containerCount, json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'color', c.color)) AS categories FROM containers cont LEFT JOIN containers cont2 ON cont.id = cont.container LEFT JOIN items i ON cont.id = i.container LEFT JOIN item_category ic ON i.id = ic.item_id LEFT JOIN categories c ON ic.category_id = c.id LEFT JOIN locations l ON cont.location = l.id GROUP BY cont.id, l.name ORDER BY cont.id",
  );
  return rows;
}

async function getAllParentContainers() {
  const { rows } = await pool.query(
    "SELECT cont.*, l.name AS locationName, json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'color', c.color)) AS categories FROM containers cont JOIN items i ON cont.id = i.container JOIN item_category ic ON i.id = ic.item_id JOIN categories c ON ic.category_id = c.id JOIN locations l ON cont.location = l.id WHERE cont.container IS NULL GROUP BY cont.id, l.id ORDER BY cont.id",
  );
  return rows;
}

async function getAllItems() {
  const { rows } = await pool.query(
    "SELECT i.*, cont.name AS containername, json_agg(json_build_object('id', c.id, 'name', c.name, 'color', c.color)) AS categories FROM items i LEFT JOIN containers cont ON i.container = cont.id JOIN item_category ic ON i.id = ic.item_id JOIN categories c ON ic.category_id = c.id GROUP BY i.id, cont.name ORDER BY i.id",
  );
  return rows;
}

async function getAllLocations() {
  const { rows } = await pool.query(
    "SELECT l.*, COUNT(c.id) as count FROM locations l JOIN containers c ON l.id = c.location GROUP BY l.id ORDER BY l.id",
  );
  return rows;
}

async function getAllCategories() {
  const { rows } = await pool.query("SELECT * FROM categories");
  return rows;
}

async function getContainersByLocationId(locationId) {
  const { rows } = await pool.query(
    "SELECT cont.*, l.name AS locationName, json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'color', c.color)) AS categories FROM containers cont JOIN items i ON cont.id = i.container JOIN item_category ic ON i.id = ic.item_id JOIN categories c ON ic.category_id = c.id JOIN locations l ON cont.location = l.id WHERE cont.location = $1 GROUP BY cont.id, l.id ORDER BY cont.id",
    [locationId],
  );
  return rows;
}

async function getContainersInsideContainer(containerId) {
  const { rows } = await pool.query(
    "WITH RECURSIVE search_containers(id, container) AS (SELECT c.id, c.container FROM containers c WHERE c.container = $1 UNION ALL SELECT c.id, c.container FROM containers c, search_containers sc WHERE sc.id = c.container AND c.container IS NOT NULL)SELECT DISTINCT array_agg(id) AS arr FROM search_containers",
    [containerId],
  );
  return rows;
}

async function getAllCategories() {
  const { rows } = await pool.query(
    "SELECT c.*, COUNT(ic.category_id) AS count FROM categories c RIGHT JOIN item_category ic ON c.id = ic.category_id GROUP BY c.id",
  );
  return rows;
}

async function getItemsByCategoryId(categoryId) {
  // need to put item_category thing to filter items with
  const { rows } = await pool.query(
    "SELECT i.*, cont.name AS containername, json_agg(json_build_object('id', c.id, 'name', c.name, 'color', c.color)) AS categories FROM items i LEFT JOIN containers cont ON i.container = cont.id JOIN item_category ic ON i.id = ic.item_id JOIN categories c ON ic.category_id = c.id WHERE ic.category_id = $1 GROUP BY i.id, cont.name ORDER BY i.id",
    [categoryId],
  );
  return rows;
}

async function getCountCategories() {
  const { rows } = await pool.query("SELECT COUNT(id) FROM categories");
  return rows;
}

async function getItemsInContainer(containerId) {
  const { rows } = await pool.query(
    "SELECT i.*, cont.name AS containername, json_agg(json_build_object('id', c.id, 'name', c.name, 'color', c.color)) AS categories FROM items i LEFT JOIN containers cont ON i.container = cont.id JOIN item_category ic ON i.id = ic.item_id JOIN categories c ON ic.category_id = c.id WHERE i.container = ANY($1) GROUP BY i.id, cont.name ORDER BY i.container,i.id",
    [containerId],
  );
  return rows;
}

async function getUnorganizedItems() {
  const { rows } = await pool.query(
    "SELECT i.*, cont.name AS containername, json_agg(json_build_object('id', c.id, 'name', c.name, 'color', c.color)) AS categories FROM items i LEFT JOIN containers cont ON i.container = cont.id JOIN item_category ic ON i.id = ic.item_id JOIN categories c ON ic.category_id = c.id WHERE i.container IS NULL GROUP BY i.id, cont.name ORDER BY i.id",
  );
  return rows;
}

async function getUnorganizedContainers() {
  const { rows } = await pool.query(
    "SELECT * FROM containers WHERE location IS NULL AND container IS NULL",
  );
  return rows;
}

async function getContainerNames(params) {
  const { rows } = await pool.query("SELECT name FROM containers");
  return rows;
}

async function getContainerNameById(id) {
  const { rows } = await pool.query(
    `SELECT name FROM containers
    WHERE id = $1`,
    [id],
  );
  return rows;
}

async function addContainer(name, location, container, photoURL, note) {
  const values = [
    name ?? null,
    location ?? null,
    container ?? null,
    photoURL ?? null,
    note ?? null,
  ];
  const res = await pool.query(
    "INSERT INTO containers (name, location, container, photoURL, note) VALUES ($1,$2,$3,$4,$5)",
    values,
  );
}

async function updateContainer(id, name, location, container, photoURL, note) {
  const values = [
    name,
    location ?? null,
    container ?? null,
    photoURL ?? null,
    note ?? null,
    id,
  ];

  if (!id) throw new Error("ID is required.");
  if (!name) throw new Error("Name is required");

  const res = await pool.query(
    `UPDATE containers SET 
    name = $1, 
    location = COALESCE($2, location), 
    container = COALESCE($3, container), 
    photoURL = COALESCE($4, photoURL), 
    note = COALESCE($5, note) 
    WHERE id = $6 
    RETURNING *`,
    values,
  );
  return res.rows[0];
}

async function addItem(name, quantity, container, photoURL, note) {
  const values = [
    name,
    quantity,
    container ?? null,
    photoURL ?? null,
    note ?? null,
  ];
  const res = await pool.query(
    "INSERT INTO items (name, quantity, container, photoURL, note) VALUES ($1,$2,$3,$4,$5)",
    values,
  );
}

async function updateItem(id, name, quantity, container, photoURL, note) {
  const values = [
    name,
    quantity,
    container ?? null,
    photoURL ?? null,
    note ?? null,
    id,
  ];
  const res = await pool.query(
    "UPDATE items SET name=$1, quantity=$2, container=$3, photoURL=$4, note=$5 WHERE id = $6 RETURNING *",
    values,
  );
}

async function getContainer(id) {
  const { rows } = await pool.query(
    "SELECT * FROM containers WHERE containers.id = $1",
    [id],
  );
  return rows;
}

async function unassignItemsFromContainer(containerId) {
  const res = await pool.query(
    "UPDATE items SET container=null WHERE container = $1",
    [containerId],
  );
}

async function postDeleteContainer(id) {
  const res = await pool.query("DELETE FROM containers WHERE id = $1", [id]);
  return res;
}

module.exports = {
  getAllContainers,
  getAllParentContainers,
  getAllItems,
  getAllLocations,
  getAllCategories,
  getContainersByLocationId,
  getContainersInsideContainer,
  getItemsInContainer,
  getAllCategories,
  getItemsByCategoryId,
  getCountCategories,
  getUnorganizedContainers,
  getUnorganizedItems,
  getContainerNames,
  getContainerNameById,
  addContainer,
  updateContainer,
  addItem,
  updateItem,
  getContainer,
  postDeleteContainer,
  unassignItemsFromContainer,
};
