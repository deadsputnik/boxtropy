const { loadEnvFile } = require("node:process");
process.loadEnvFile("./.env");

const express = require("express");
const app = express();
const path = require("node:path");
const router = require("./routes/router");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use("/", router);

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Boxtropy app listening on ${PORT}`);
});
