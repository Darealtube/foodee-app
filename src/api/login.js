const User = require("../../schemas/UserSchema");
const express = require("express");
const bcrypt = require("bcrypt"); // bcrypt is what we use to hash our passwords
const router = express.Router();
const saltRounds = 12; // 12 salt rounds for an overkill password hashing

// This sets up the POST reciever of the login API where the user is either logged in or signed up
router.post("/api/login", async (req, res) => {
  const name = req.body.username;
  const password = req.body.password;
  const operation = req.body.operation;

  try {
    // First we find if a user already exists with the same name
    const existingUser = await User.findOne({ name });

    // If the user is trying to login,
    if (operation === "login") {
      // And there is no existing user with the name,
      if (!existingUser) {
        res.status(401).json({ error: "Login failed. User not found." });
      } else {
        // Check if the password input is same as the existing user's password using bcrypt.compare (because the password in the database is hashed)
        bcrypt.compare(password, existingUser.password, (error, result) => {
          if (error || !result) {
            res.status(401).json({ error: "Login failed. Wrong credentials." });
          } else {
            res.status(200).json(existingUser);
          }
        });
      }
    // If the user is trying to register,
    } else if (operation === "register") {
      // And there is already an existing user with the name,
      if (existingUser) {
        res.status(401).json({ error: "Username already exists." });
      } else {
        // Generate a salt hashed password for the password input and assign it to the user's password in the database
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ name, password: hashedPassword });
        res.status(201).json(newUser);
      }
    } else {
      res.status(400).json({ error: "Invalid operation" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

module.exports = router;
