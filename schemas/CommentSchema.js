import mongoose from "mongoose";

// Define your schemas and models here
const Schema = mongoose.Schema;
const CommentSchema = new Schema({
  author: mongoose.Schema.Types.ObjectId,
  post: mongoose.Schema.Types.ObjectId,
  date_created: {
    type: Date,
    default: Date.now,
  },
  message: {
    type: String,
    required: true,
    maxlength: 400,
  },
});

const Comment = mongoose.model("Comment", CommentSchema);
export default mongoose.models.Comment || Comment;
