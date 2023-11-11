const User = require("../../schemas/UserSchema");
const express = require("express");
const router = express.Router();

// Gets the information of a single user profile (PROVEN TO WORK PROPERLY)
router.get("/api/profile", async (req, res) => {
  let profile = req.query.p; // USER ID
  try {
    const user = await User.findById(profile);
    console.log(user);
    res.json(user).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while fetching the user." });
  }
});

// Updates the information of a single user profile (PROVEN TO WORK PROPERLY)
router.put("/api/profile", async (req, res) => {
  let { profile, address, bio, pfp, header } = req.body;
  try {
    await User.updateOne({ _id: profile }, { address, bio, pfp, header });
    res.json({ message: "User updated successfully." }).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while updating the user." });
  }
});

// Deletes a single user (PROVEN TO WORK PROPERLY)
router.delete("/api/profile", async (req, res) => {
  let profile = req.body.profile;

  try {
    await User.deleteOne({ _id: profile });
    res.json({ message: "User deleted successfully." }).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while deleting the user." });
  }
});

module.exports = router;
