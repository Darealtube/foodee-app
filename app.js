const connectDB = require("./dbConnect.js");
const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");

connectDB();
const db = mongoose.connection;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("src"));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
