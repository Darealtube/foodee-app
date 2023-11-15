const Comment = require("../../schemas/CommentSchema");
const User = require("../../schemas/UserSchema");
const express = require("express");
const router = express.Router();
const commentPerPage = 3; // This can be changed
var passport = require("passport")
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
    await Comment.create({ post, author, message }); // Darryl Javier for the meantime
    res.json({ message: "Comment created successfully." }).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while creating your comment." });
  }
});

// Updates the message of a comment on a post (PROVEN TO WORK PROPERLY)
router.put(
  "/api/comments",
  passport.authenticate("jwt", { session: false }), // Add this to add an authentication layer to the API. It checks if the user is logged in.
  async (req, res) => {
    let commentID = req.body.comment; // Comment ID
    let message = req.body.message;

    try {
      const comment = Comment.findById(commentID);

      if (comment.author != req.user.name) {
        res
          .status(401)
          .json({ error: "You are not allowed to edit this comment." });
      }

      await Comment.updateOne({ _id: commentID, message });
      res.json({ message: "Comment updated successfully." }).status(200);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occured while updating your comment." });
    }
  }
);

// Deletes a comment on a post (PROVEN TO WORK PROPERLY)
router.delete(
  "/api/comments",
  passport.authenticate("jwt", { session: false }), // Add this to add an authentication layer to the API. It checks if the user is logged in.
  async (req, res) => {
    let commentID = req.body.comment;

    try {
      const comment = Comment.findById(commentID);

      if (comment.author != req.user.name) {
        res
          .status(401)
          .json({ error: "You are not allowed to edit this comment." });
      }

      await Comment.deleteOne({ _id: commentID });
      res.json({ message: "Comment deleted successfully." }).status(200);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occured while deleting your comment." });
    }
  }
);

module.exports = router;
