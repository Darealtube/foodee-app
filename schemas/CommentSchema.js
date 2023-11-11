const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const CommentSchema = new Schema({
  author: String,
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
module.exports = mongoose.models.Comment || Comment;
