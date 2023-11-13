const User = require("../../schemas/UserSchema");
const express = require("express");
const router = express.Router();
var passport = require("passport")
// Gets the information of a single user profile (PROVEN TO WORK PROPERLY)
router.get("/api/profile", async (req, res) => {
  let profile = req.query.p; // USER NAME
  try {
    const user = await User.findOne({ name: profile });
    res.json(user).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while fetching the user." });
  }
});

// Updates the information of a single user profile (PROVEN TO WORK PROPERLY)
router.put(
  "/api/profile",
  passport.authenticate("jwt", { session: false }), // Add this to add an authentication layer to the API. It checks if the user is logged in.
  async (req, res) => {
    let { profile, address, bio, pfp, header } = req.body;

    if (profile != req.user.name) {
      res
        .status(401)
        .json({ error: "You are not allowed to edit this profile." });
    }

    try {
      await User.updateOne({ name: profile }, { address, bio, pfp, header });
      res.json({ message: "User updated successfully." }).status(200);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occured while updating the user." });
    }
  }
);

// Deletes a single user (PROVEN TO WORK PROPERLY)
router.delete(
  "/api/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let profile = req.body.profile;

    if (profile != req.user.name) {
      res
        .status(401)
        .json({ error: "You are not allowed to delete this profile." });
    }

    try {
      await User.deleteOne({ name: profile });
      res.json({ message: "User deleted successfully." }).status(200);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occured while deleting the user." });
    }
  }
);

module.exports = router;
