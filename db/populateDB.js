const { Client } = require("pg");
const { loadEnvFile } = require("node:process");
loadEnvFile("./.env");

const SQL = `
CREATE TABLE IF NOT EXISTS locations (
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
name VARCHAR (255),
photoURL TEXT
);

CREATE TABLE IF NOT EXISTS containers (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR (255),
  location INTEGER REFERENCES locations,
  container INTEGER REFERENCES containers,
  photoURL TEXT,
  note TEXT,
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
  name VARCHAR (255),
  color TEXT
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

INSERT INTO locations (name, photoURL) VALUES ('garage', 'locations/location-1.jpg'), ('living room', 'locations/location-2.jpg');
INSERT INTO categories (name, color) VALUES ('tools', 'red'), ('hardware', 'blueviolet'), ('office', 'deepskyblue'), ('black', 'black');

INSERT INTO containers (name, location, photoURL) VALUES 
('lamma', '1', 'containers/container-1.jpg'),
('plush', '1', 'containers/container-2.jpg'),
('copper', '2', 'containers/container-3.jpg'),
('tungsten', '2', 'containers/container-4.jpg');
INSERT INTO containers (name, container, photoURL) VALUES 
('riddium', '4', 'containers/container-5.jpg');
INSERT INTO items (name, quantity, container, photoURL, note) VALUES 
('M5 hex bolt 10mm', '20', '5', 'items/item-1.jpg', 'one'),
('M4 allen counterbore bolt', '5', '5', 'items/item-2.jpg', 'two'),
('M2 black oxide screws', '7', '2', 'items/item-3.jpg', 'three'),
('M6 cap-head bolt', '30', '2', 'items/item-4.jpg', 'four'),
('Stapler', '1', '3', 'items/item-5.jpg', 'five'),
('Mallet', '1', '4', 'items/item-6.jpg', 'six'),
('Saw', '1', '1', 'items/item-7.jpg', 'seven'),
('Screwdriver', '1', '1', 'items/item-8.jpg', 'eight');

INSERT INTO items (name, quantity, photoURL, note) VALUES 
('pliers', '1', 'items/item-9.jpg', 'Good pliers'),
('crimp tool', '1', 'items/item-10.jpg', 'Should get a better one soon');


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
