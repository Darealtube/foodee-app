const Post = require("../../schemas/PostSchema");
const User = require("../../schemas/UserSchema");
const Like = require("../../schemas/LikesSchema");
const Categories = require("../../schemas/CategorySchema");
const passport = require("passport");
const express = require("express");
const jwt = require("jsonwebtoken");
const imageUploader = require("../../imageUploader");
const upload = require("../../multer");
const router = express.Router();

const postPerPage = 5; // This can be changed

// Get many posts (homepage posts) (PROVEN TO WORK PROPERLY)
router.get("/api/posts", async (req, res) => {
  // Get the query parameters in the request url (f for filter, c for category, and p for page number)
  let pageOffset = (parseInt(req.query.p) || 0) * postPerPage;
  let filter = req.query.f || "date";
  let category = req.query.c;

  try {
    // The $in aggregate checks if the categories array has atleast one of its categories equal to the category parameter. It only does this check if there is a category on the url parameter.

    const posts = await Post.find(
      category && {
        categories: { $elemMatch: { $regex: new RegExp(category, "i") } },
      }
    )
      .skip(pageOffset)
      .limit(postPerPage)
      .sort(filter === "date" ? { date_created: -1 } : { likes: -1 });
    res.json(posts).status(200);
  } catch (error) {
    res.status(500).json({ error: "An error occured while fetching posts." });
  }
});

// Get a single post (PROVEN TO WORK PROPERLY)
router.get("/api/posts/:id", async (req, res) => {
  let postId = req.params.id; // POST ID
  var loggedInUser = null;

  try {
    var isLiked = false;
    if (req.cookies.session) {
      loggedInUser = jwt.verify(req.cookies.session, process.env.JWT_SECRET);
      isLiked = await Like.exists({ user: loggedInUser.name, post: postId });
    }
    /* const isLiked = await Like.exists({ user: loggedInUser.name }); */
    const post = await Post.findById(postId);
    const author = await User.findOne({ name: post.author });
    const postAndAuthor = {
      ...post.toObject(),
      authorPFP: author.pfp,
      isLiked: isLiked ? true : false,
    };
    res.json(postAndAuthor).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while fetching the post." });
  }
});

router.get("/api/posts/profile/:id", async (req, res) => {
  // Get the query parameters in the request url (f for filter, c for category, and p for page number)
  let user = req.params.id;
  let pageOffset = (parseInt(req.query.p) || 0) * postPerPage;
  let filter = req.query.f || "date";

  try {
    const posts = await Post.find({ author: user })
      .skip(pageOffset)
      .limit(postPerPage)
      .sort(filter === "date" ? { date_created: -1 } : { likes: -1 });
    res.json(posts).status(200);
  } catch (error) {
    res.status(500).json({ error: "An error occured while fetching posts." });
  }
});

router.put(
  "/api/posts/favorite",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let post = req.body.post; // POST ID
    let { name } = req.user; // You can access the logged in user's data with req.user since in our strategy, when there is a user it's assigned to "user"

    const isLiked = await Like.exists({ user: name, post });
    try {
      if (isLiked) {
        await Like.deleteOne({ user: name, post });
        await Post.updateOne({ _id: post }, { $inc: { likes: -1 } });
      } else {
        await Like.create({ user: name, post });
        await Post.updateOne({ _id: post }, { $inc: { likes: 1 } });
      }
      res.status(200);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occured while updating the post." });
    }
  }
);

// Update a post using PUT method (PROVEN TO WORK PROPERLY)
router.put(
  "/api/posts",
  passport.authenticate("jwt", { session: false }),
  upload.any(), // Add this to add an authentication layer to the API. It checks if the user is logged in.
  async (req, res) => {
    let post = req.body.post; // POST ID
    // The JSON in the request when requesting from client to server should be something like:
    // JSON.Stringify({post_img: ..., caption: ..., etc.})
    const { title, caption, location, categories } = req.body;

    try {
      const postImgURL = await imageUploader(req.files[0]);
      const oldPost = await Post.findById(post);

      if (oldPost.author != req.user.name) {
        res
          .status(401)
          .json({ error: "You are not allowed to edit this post." });
      }

      const newPost = await Post.findOneAndUpdate(
        { _id: post },
        {
          ...(postImgURL && { post_img: postImgURL }),
          caption,
          location,
          categories: categories.split(",").map((cat) => cat.trim()),
          title,
        },
        { new: true }
      );

      // Decrease the post count of categories removed
      for (let i = 0; i < oldPost.categories.length; ++i) {
        if (!newPost.categories.includes(oldPost.categories[i])) {
          await Categories.updateOne(
            { name: oldPost.categories[i] },
            { $inc: { post_count: -1 } }
          );
        }
      }

      // Increase the post count of categories on the posts
      for (let i = 0; i < newPost.categories.length; ++i) {
        await Categories.updateOne(
          { name: newPost.categories[i] },
          { $inc: { post_count: 1 } },
          { upsert: true }
        );
      }

      res.status(200).json({
        message: "Updated post successfully. Going back to homepage...",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while editing the post." });
    }
  }
);

// Create a post using POST method (PROVEN TO WORK PROPERLY)
router.post(
  "/api/posts",
  passport.authenticate("jwt", { session: false }),
  upload.any(), // Add this to add an authentication layer to the API. It checks if the user is logged in.
  async (req, res) => {
    let author = req.user; // Logged in user
    const { title, caption, location, categories } = req.body;

    try {
      const postImgURL = await imageUploader(req.files[0]);

      await Post.create({
        post_img: postImgURL,
        title,
        caption,
        location,
        categories: categories.split(",").map((cat) => cat.trim()),
        author: author.name,
      });

      for (let i = 0; i < categories.length; ++i) {
        await Categories.updateOne(
          { name: categories[i] },
          { $inc: { post_count: 1 } },
          { upsert: true } // Upsert means that if no category exists, it will create one and update that.
        );
      }

      res.status(200).json({
        message: "Created post successfully. Going back to homepage...",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occured while updating the post." });
    }
  }
);

// Delete a post using DELETE method (PROVEN TO WORK PROPERLY)
router.delete(
  "/api/posts",
  passport.authenticate("jwt", { session: false }), // Add this to add an authentication layer to the API. It checks if the user is logged in.
  async (req, res) => {
    let post = req.body.post; // POST ID
    try {
      const post = await Post.findById(post);

      if (post.author != req.user.name) {
        res
          .status(401)
          .json({ error: "You are not allowed to delete this post." });
      }

      await Post.deleteOne({ _id: post });
      res.status(200).json({ message: "Deleted post successfully." });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occured while deleting the post." });
    }
  }
);

module.exports = router;
