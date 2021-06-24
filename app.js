//jshint esversion:6

const express = require("express");

const app = express();
let port = process.env.PORT || 3000;

app.use(express.static("public/"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, function () {
  console.log("Server started on port 3000");
});
