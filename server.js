const express = require("express");
const path = require("path");
const app = express();

app.use(express.static("website"));

["index", "servers", "errors", "donate", "api"].forEach(route => {
  app.get("/" + route, (_, res) =>
    res.sendFile(path.join(__dirname, `website/${route}.html`))
  );
});

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, "website/404.html")));

app.listen(3005);