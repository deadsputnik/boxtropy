const { loadEnvFile } = require("node:process");
process.loadEnvFile("./.env");

const express = require("express");
const app = express();
const path = require("node:path");
const router = require("./routes/router");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "fileStore")));
app.use("/", router);

const PORT = process.env.APP_PORT || 3000;
const server = app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Boxtropy app listening on ${PORT}`);
});

process.on("SIGINT", () => {
  console.log("Exiting...");
  server.close(() => {
    console.log("DONE");
    process.exit(0); // Exits only after all connections are cleanly closed
  });
});

process.on("SIGTSTP", () => {
  console.log("SUSPENDED - DID NOT KILL - TO KILL - run 'kill -9 %1'");
});
