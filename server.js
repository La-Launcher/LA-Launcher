const express = require("express");
const path = require("path");
const app = express();
const PLATFORM_NAME = process.env.PLATFORM_NAME ?? "la5m";

app.use(express.static("website"));

["", "servers", "errors", "donate", "api"].forEach(route => {
  app.get("/" + route, (_, res) => res.sendFile(path.join(__dirname, `website/${PLATFORM_NAME}/${route || "index"}.html`)));
});

app.use((_, res) => res.status(404).sendFile(path.join(__dirname, `website/${PLATFORM_NAME}/404.html`)));

app.listen(3005);
