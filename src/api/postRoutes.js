const Post = require("../../schemas/PostSchema");
const Like = require("../../schemas/LikesSchema");
const Categories = require("../../schemas/CategorySchema");
const express = require("express");
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
      category && { categories: { $in: [category] } }
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
  try {
    const post = await Post.findById(postId);
    res.json(post).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while fetching the post." });
  }
});

// Update a post by liking (PROVEN TO WORK PROPERLY)
router.put("/api/posts/like", async (req, res) => {
  let post = req.body.post; // POST ID
  let user = req.body.user;

  try {
    await Like.create({ user: "Darryl Javier", post }); // Darryl Javier for now because there's not yet session management
    await Post.updateOne({ _id: post }, { $inc: { likes: 1 } });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while updating the post." });
  }
});

// Update a post by disliking (PROVEN TO WORK PROPERLY)
router.put("/api/posts/dislike", async (req, res) => {
  let post = req.body.post; // POST ID
  let author = req.body.user;

  try {
    // If dislike operation,
    await Like.deleteOne({ user: "Darryl Javier", post }); // Darryl Javier for now because there's not yet session management
    await Post.updateOne({ _id: post }, { $inc: { likes: -1 } });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while updating the post." });
  }
});

// Update a post using PUT method (PROVEN TO WORK PROPERLY)
router.put("/api/posts", async (req, res) => {
  let post = req.body.post; // POST ID
  // The JSON in the request when requesting from client to server should be something like:
  // JSON.Stringify({post_img: ..., caption: ..., etc.})
  const { post_img, caption, location, categories } = req.body; // Use destructuring operation to get values from object

  try {
    const oldPost = await Post.findById(post);
    const newPost = await Post.findOneAndUpdate(
      { _id: post },
      { post_img, caption, location, categories },
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
});

// Create a post using POST method (PROVEN TO WORK PROPERLY)
router.post("/api/posts", async (req, res) => {
  let post = req.body.post; // POST ID
  let author = req.body.user; // Logged in user
  const { post_img, caption, location, categories } = req.body;

  try {
    await Post.create({
      post_img,
      caption,
      location,
      categories,
      author: "Darryl Javier",
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
});

// Delete a post using DELETE method (PROVEN TO WORK PROPERLY)
router.delete("/api/posts", async (req, res) => {
  let post = req.body.post; // POST ID
  try {
    await Post.deleteOne({ _id: post });
    res.status(200).json({ message: "Deleted post successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while deleting the post." });
  }
});

module.exports = router;
