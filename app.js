const connectDB = require("./dbConnect.js");
const express = require("express");

// Call the db connector
connectDB();
const app = express();

// Setup the middlewares, the express body parser and express.static("src") so that it would serve html files
app.use(express.json());
app.use(express.static("src"));

const PORT = process.env.PORT || 3000;

// Import the routes found in the /api folder
const loginRoute = require("./src/api/login.js");
const categoryRoutes = require("./src/api/categoryRoutes.js");
const commentRoutes = require("./src/api/commentRoutes.js");
const postRoutes = require("./src/api/postRoutes.js");
const profileRoutes = require("./src/api/profileRoutes.js");

// Use those routes for the entire app
// The other ones are commented out here because unless they are exporting a router,
// it would throw an error saying that Router.use() expected a middleware but got an object

app.use(loginRoute);
app.use(postRoutes);
app.use(categoryRoutes);
/* app.use("/category", categoryRoutes);
app.use("/comment", commentRoutes);
app.use("/post", postRoutes);
app.use("/profile", profileRoutes); */

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
