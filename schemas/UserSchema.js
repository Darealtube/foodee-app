const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bioMaxLength = 400;
const addressMaxLength = 50;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    maxlength: [addressMaxLength, "Address cannot exceed 50 characters."],
  },
  bio: {
    type: String,
    maxlength: [bioMaxLength, "Bio cannot exceed 400 characters."],
  },
  pfp: String,
  header: String,
});

const User = mongoose.model("User", UserSchema);
module.exports = mongoose.models.User || User;