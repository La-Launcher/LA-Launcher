const express = require("express");
const path = require("path");
const app = express();
const PLATFORM_NAME = process.env.PLATFORM_NAME ?? "la5m";
const BASE_DIR = path.join(__dirname, "website", PLATFORM_NAME);

app.use(express.static(BASE_DIR));

["index", "servers", "errors", "donate", "api"].forEach(route => {
  app.get("/" + (route === "index" ? "" : route), (_, res) => res.sendFile(path.join(BASE_DIR, ${route}.html)));
});

app.use((_, res) => res.status(404).sendFile(path.join(BASE_DIR, "404.html")));

app.listen(3005);
