const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const LikeSchema = new Schema({
  user: String,
  post: mongoose.Schema.Types.ObjectId,
  date_created: {
    type: Date,
    default: Date.now,
  },
});

const Like = mongoose.model("Like", LikeSchema);
module.exports = mongoose.models.Like || Like;
