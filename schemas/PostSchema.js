const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  post_img: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  location: {
    type: String,
    required: true,
  },
  date_created: {
    type: Date,
    default: Date.now, // Remember to use Date.now instead of Date.now() so that everytime mongo creates, it executes the function rather than putting the same date in every data
  },
  likes: {
    type: Number,
    default: 0,
  },
  author: { type: String, required: true },
  categories: { type: [String], required: true },
});

const Post = mongoose.model("Post", PostSchema);

module.exports = mongoose.models.Post || Post;
