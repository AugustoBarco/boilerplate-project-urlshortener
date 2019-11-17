"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var env = require("node-env-file");
const dns = require("dns");
env(__dirname + "/.env");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

//process.env.MONGOLAB_URI = "mongodb://localhost/test";

mongoose.connect(process.env.MONGOLAB_URI, {
  useMongoClient: true
});

let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

let schemaUrl = new mongoose.Schema({
  original_url: String,
  short_url: String
});

let urlModel = mongoose.model("url", schemaUrl);

mongoose.connection.on("connected", (err, data) => {
  if (err) {
    throw err(err);
  }
  console.log("I'm connected");
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/new", function(req, res) {
  let urlTest = new urlModel({
    original_url: req.body.url
  });

  dns.lookup(urlTest.original_url, err => {
    if (err) {
      res.json(res.json({ error: "invalid URL" }));
    }
    urlTest.save();
    res.json({ original_url: urlTest.original_url, short_url: urlTest._id });
  });
});

app.get("/api/shorturl/:id", function(req, res) {
  urlModel.findById(req.params.id, function(err, data) {
    if(err){res.json({ error: "invalid SHORTURL" })}
    res.redirect("https://" + data.original_url)
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
