const mongoose = require("mongoose");

const Schema = mongoose.Schema;
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
  address: String,
  bio: {
    type: String,
    maxlength: 400,
  },
  pfp: String,
  header: String,
});

const User = mongoose.model("User", UserSchema);
module.exports = mongoose.models.User || User;
