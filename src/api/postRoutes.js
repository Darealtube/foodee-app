const Post = require("../../schemas/PostSchema");
const express = require("express");
const router = express.Router();

const postPerPage = 5; // This can be changed

router.get("/api/posts", async (req, res) => {
  // Get the query parameters in the request url (f for filter, c for category, and p for page number)
  let pageOffset = (parseInt(req.query.p) || 0) * postPerPage;
  let filter = req.query.f || "date";
  let category = req.query.c;

  try {
    // The $in aggregate checks if the categories array has atleast one of its categories equal to the category parameter. It only does this check if there is a category on the url parameter.
    const posts = await Post.find(
      category && { categories: { $in: [category] } }
    )
      .skip(pageOffset)
      .limit(postPerPage)
      .sort(filter === "date" ? { date_created: -1 } : { likes: -1 });
    res.json(posts).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while fetching your post." });
  }
});

module.exports = router;
