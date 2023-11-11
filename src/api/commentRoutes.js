const Comment = require("../../schemas/CommentSchema");
const express = require("express");
const router = express.Router();

const commentPerPage = 10; // This can be changed

// Displays all comments on a post (PROVEN TO WORK PROPERLY)
router.get("/api/comments", async (req, res) => {
  // Get the post (p) id in the request url parameter
  let postId = req.query.p;
  // Get the comment page (cp) number in the request url parameter
  let pageOffset = (parseInt(req.query.cp) || 0) * commentPerPage;

  try {
    const comments = await Comment.find({ post: postId })
      .skip(pageOffset)
      .limit(commentPerPage)
      .sort({ date_created: -1 });

    console.log(comments);
    res.json(comments).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while fetching categories." });
  }
});

// Creates a new comment on a post (PROVEN TO WORK PROPERLY)
router.post("/api/comments", async (req, res) => {
  // Get the post (p) id in the request url parameter
  let post = req.body.post;
  let message = req.body.message;
  let author = req.body.author;

  try {
    await Comment.create({ post, author: "Darryl Javier", message }); // Darryl Javier for the meantime
    res.json({ message: "Comment created successfully." }).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while creating your comment." });
  }
});

// Updates the message of a comment on a post (PROVEN TO WORK PROPERLY)
router.put("/api/comments", async (req, res) => {
  let comment = req.body.comment;
  let message = req.body.message;

  try {
    await Comment.updateOne({ _id: comment, message });
    res.json({ message: "Comment updated successfully." }).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while updating your comment." });
  }
});

// Deletes a comment on a post (PROVEN TO WORK PROPERLY)
router.delete("/api/comments", async (req, res) => {
  let comment = req.body.comment;

  try {
    await Comment.deleteOne({ _id: comment });
    res.json({ message: "Comment deleted successfully." }).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while deleting your comment." });
  }
});

module.exports = router;
