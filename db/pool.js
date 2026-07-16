const Pool = require("pg");

module.exports = newPool({
  host: process.env.DB_HOST || localhost,
  user: process.env.DB_USER,
  database: process.env.DB_DB,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT),
});
