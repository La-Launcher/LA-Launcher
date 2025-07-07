const express = require("express");
const path = require("path");
const app = express();

app.use(express.static("website"));

["", "servers", "errors", "donate"].forEach(route => {
  app.get("/" + route, (_, res) =>
    res.sendFile(path.join(__dirname, `website/${route || "index"}.html`))
  );
});

app.use((_, res) => res.status(404).sendFile(path.join(__dirname, "website/404.html")));

app.listen(3005);