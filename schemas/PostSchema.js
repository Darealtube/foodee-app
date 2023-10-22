import mongoose from "mongoose";

// Define your schemas and models here
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
    default: Date.now,
  },
  likes: Number,
  author: mongoose.Schema.Types.ObjectId,
  categories: mongoose.Schema.Types.ObjectId,
});

const Post = mongoose.model("Post", PostSchema);

export default mongoose.models.Post || Post;
