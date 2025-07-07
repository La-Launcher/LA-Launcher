const express = require("express");
const path = require("path");

const app = express();
const PORT = 3005;
const HOST = process.env.LIARA_URL || "localhost";

app.use(express.static(path.join(__dirname, "website")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "/website/index.html"));
});

app.get("/servers", (_, res) => {
  res.sendFile(path.join(__dirname, "/website/servers.html"));
});

app.get("/errors", (_, res) => {
  res.sendFile(path.join(__dirname, "/website/errors.html"));
});

app.get("/donate", (_, res) => {
  res.sendFile(path.join(__dirname, "/website/donate.html"));
});

app.listen(PORT, () => {
  console.log(`App listening on ${HOST}:${PORT}`);
});