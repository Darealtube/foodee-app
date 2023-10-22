const { default: mongoose } = require("mongoose");
require("dotenv").config();

// Replace 'YOUR_MONGODB_URI' with your actual MongoDB connection string
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
