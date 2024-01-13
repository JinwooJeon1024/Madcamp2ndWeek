require('dotenv').config();
const mongoose = require("mongoose");
const connectionString = process.env.database_url;

exports.mongoDB = () => {
  mongoose
  .connect(connectionString)
  .then(() => console.log("connected"))
  .catch((err) => console.log("mongodb connection failed", err));
}