import mongoose from "mongoose";

// Define your schemas and models here
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 20,
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
export default mongoose.models.User || User;
