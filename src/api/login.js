const User = require("../../schemas/UserSchema");
const express = require("express");
const bcrypt = require("bcrypt"); // bcrypt is what we use to hash our passwords
var jwt = require("jsonwebtoken"); // For JWT authentication
const router = express.Router();
const saltRounds = 12; // 12 salt rounds for an overkill password hashing
var passport = require("passport");
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
            // Create a JWT Token for the user's name to be used for authentication and session management
            const token = jwt.sign(
              { name: existingUser.name },
              process.env.JWT_SECRET,
              {
                expiresIn: 60 * 60 * 24 * 7,
              }
            );
            // Put that token inside a cookie. The cookie key is "session" and the value is the user's name.
            res.cookie("session", token, {
              httpOnly: true,
              secure: true,
              maxAge: 60 * 60 * 24 * 7, // One week
            });
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
        // Create a JWT Token for the user's name to be used for authentication and session management
        const token = jwt.sign({ name: newUser.name }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
        // Put that token inside a cookie
        res.cookie("session", token, {
          httpOnly: true,
          secure: true,
          maxAge: 60 * 60 * 24 * 7, // One week
        });
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

// This clears the session cache and effectively logs out the user.
router.post(
  "/api/logout",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user) {
      res.clearCookie("session");
      res.status(200).json({ message: "Logged out successfully." });
    }
  }
);

// This gets the current logged in user data.
router.get(
  "/api/session",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user).status(200);
  }
);

module.exports = router;
