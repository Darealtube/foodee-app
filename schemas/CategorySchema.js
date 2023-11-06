const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
  post_count: Number,
});

const Category = mongoose.model("Category", CategorySchema);
module.exports =  mongoose.models.Category || Category;
