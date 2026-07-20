const { Client } = require("pg");
const { loadEnvFile } = require("node:process");
loadEnvFile("./.env");

const SQL = `
CREATE TABLE IF NOT EXISTS containers (
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
name VARCHAR (255),
location VARCHAR (255),
container VARCHAR (255),
photoURL TEXT,
lastUpdated TIMESTAMP,
created TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS items (
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
name VARCHAR (255) NOT NULL,
quantity INTEGER NOT NULL,
container INTEGER REFERENCES containers,
photoURL TEXT,
note TEXT,
lastUpdated TIMESTAMP,
created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
category VARCHAR (255)
);

CREATE TABLE IF NOT EXISTS locations (
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
name VARCHAR (255),
photoURL TEXT
);

CREATE TABLE IF NOT EXISTS container_location (
  container_id INTEGER REFERENCES containers,
  location_id INTEGER REFERENCES locations,
  PRIMARY KEY (container_id, location_id)
);

CREATE TABLE IF NOT EXISTS item_category (
  item_id INTEGER REFERENCES items,
  category_id INTEGER REFERENCES categories,
  PRIMARY KEY (item_id, category_id)
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.lastUpdated := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_containers
BEFORE UPDATE ON containers
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_items
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

INSERT INTO containers (name, location, photoURL) VALUES 
('lamma', '1', '../fileStore/containers/container-1.jpg'),
('plush', '1', '../fileStore/containers/container-2.jpg'),
('copper', '2', '../fileStore/containers/container-3.jpg'),
('tungsten', '2', '../fileStore/containers/container-4.jpg');
INSERT INTO containers (name, container, photoURL) VALUES 
('riddium', '4', '../fileStore/containers/container-5.jpg');
INSERT INTO items (name, quantity, container, photoURL, note) VALUES 
('M5 hex bolt 10mm', '20', '5', '../fileStore/item/item-1.jpg', 'one'),
('M4 allen counterbore bolt', '5', '5', '../fileStore/item/item-2.jpg', 'two'),
('M2 black oxide screws', '7', '2', '../fileStore/item/item-3.jpg', 'three'),
('M6 cap-head bolt', '30', '2', '../fileStore/item/item-4.jpg', 'four'),
('Stapler', '1', '3', '../fileStore/item/item-5.jpg', 'five'),
('Mallet', '1', '4', '../fileStore/item/item-6.jpg', 'six'),
('Saw', '1', '1', '../fileStore/item/item7-.jpg', 'seven'),
('Screwdriver', '1', '1', '../fileStore/item/item-8.jpg', 'eight');

INSERT INTO items (name, quantity, photoURL, note) VALUES 
('pliers', '1', '../fileStore/item/item-9.jpg', 'Good pliers'),
('crimp tool', '1', '../fileStore/item/item-10.jpg', 'Should get a better one soon');

INSERT INTO locations (name, photoURL) VALUES ('garage', '../fileStore/location/location-1.jpg'), ('living room', '../fil eStore/location/location-2.jpg');
INSERT INTO categories (category) VALUES ('tools'), ('hardware'), ('office'), ('black');

INSERT INTO item_category (item_id, category_id) VALUES 
(1, 2),
(2, 2),
(3, 2),
(3, 4),
(4, 2),
(5, 3),
(5, 1),
(5, 4),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1);

INSERT INTO container_location (container_id, location_id) VALUES 
(1, 1),
(2, 1),
(3, 2),
(4, 2);
`;

async function main() {
  console.log("Seeding...");
  const client = new Client({
    connectionString: process.env.DB_URL,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("DONE!");
}

main();
