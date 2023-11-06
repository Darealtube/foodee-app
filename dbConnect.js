const { default: mongoose } = require("mongoose");
require("dotenv").config();

// We use environment variables to keep the MongoDB URL link private
const dbUri = process.env.MONGODB_URI;

const connectDB = () => {
  try {
    mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = connectDB;
