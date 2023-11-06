const Post = require("../../schemas/PostSchema");
const express = require("express");
const router = express.Router();

router.get("/posts", async (req, res) => {
  const ldc = req.query.ldc;
  try {
    const posts = await Post.find({ date_created: { $gte: ldc } })
      .limit(10)
      .sort({ date_created: 1 });
    res.json(posts).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while fetching your post." });
  }
});

module.exports = router;
