import $ from 'jquery';
const express = require('express');
const router = express.Router();

// Mock user data (replace this with your actual authentication logic)
const authenticateUser = (req, res, next) => {

  req.user = "darryl_javier@dlsu.edu.ph";
  next();
};

// Middleware to check if the authenticated user has the privilege to edit the profile
const canEditProfile = (req, res, next) => {
  const authenticatedUser = req.user;
  const profileUser = req.params.author;

  if (authenticatedUser === profileUser) {
    // The authenticated user can edit their own profile
    next();
  } else {
    // The authenticated user cannot edit another user's profile
    res.status(403).json({ error: "You do not have permission to edit this profile." });
  }
};

// Route for editing a user profile
router.get("/edit-profile/:author", authenticateUser, canEditProfile, (req, res) => {
  // handling profile editing idk how to do it yet
  res.send(`Editing profile for user: ${req.user}`);
});

module.exports = router;

// Get posts for a specific user profile
const filterUserPosts = async (author) => {
    try {
      const posts = await Post.find({ author })
        .sort({ date_created: -1 }) // You can adjust the sorting as needed
        .limit(postPerPage);
        
      return posts;
    } catch (error) {
      throw new Error("An error occurred while fetching user posts.");
    }
  };
  
  // Example of using the function
  // You can call this function wherever you need to fetch user posts
  const userPosts = await filterUserPosts("darryl_javier@dlsu.edu.ph");
  console.log(userPosts);