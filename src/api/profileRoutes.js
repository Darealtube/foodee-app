const User = require("../../schemas/UserSchema");
const express = require("express");
const router = express.Router();
const upload = require("../../multer");
var passport = require("passport");
const imageUploader = require("../../imageUploader");
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
  passport.authenticate("jwt", { session: false }),
  upload.any(), // Add this to add an authentication layer to the API. It checks if the user is logged in.
  async (req, res) => {
    let { address, bio } = req.body;
    try {
      if (bio && bio.length > 400) {
        return res.status(400).json({ error: "Bio cannot exceed 400 characters." });
      }
      else if (address && address.length > 100) {
        return res.status(400).json({ error: "Location cannot exceed 100 characters." });
      }

      var pfp = null;
      var header = null;

      for (let i = 0; i < req.files.length; ++i) {
        if (req.files[i].fieldname == "header") {
          header = await imageUploader(req.files[i]);
        } else {
          pfp = await imageUploader(req.files[i]);
        }
      }

      await User.updateOne(
        { name: req.user.name },
        { address, bio, ...(pfp && { pfp }), ...(header && { header }) }
      );
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
