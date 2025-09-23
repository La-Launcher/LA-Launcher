const express = require("express");
const path = require("path");
const app = express();
const PLATFORM_NAME = process.env.PLATFORM_NAME ?? "la2m";

app.use(express.static("website/assets"));

["index", "servers", "errors", "donate", "api", "payment", "boost"].forEach(route => {
  app.get("/" + (route === "index" ? "" : route), (_, res) => res.sendFile(path.join(__dirname, `website/${PLATFORM_NAME}/${route}.html`)));
});

app.use((_, res) => res.status(404).sendFile(path.join(__dirname, `website/${PLATFORM_NAME}/404.html`)));

app.listen(3005);