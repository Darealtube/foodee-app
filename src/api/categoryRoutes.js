const Category = require("../../schemas/CategorySchema");
const express = require("express");
const router = express.Router();

const categoryPerPage = 5; // This can be changed

router.get("/api/categories", async (req, res) => {
  // Get the page number in the request url parameter
  let pageOffset = (parseInt(req.query.cp) || 0) * categoryPerPage;
  try {
    const categories = await Category.find()
      .skip(pageOffset)
      .limit(categoryPerPage)
      .sort({ post_count: -1 });
    res.json(categories).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while fetching categories." });
  }
});

router.get("/api/searchCategories", async (req, res) => {
  // Get the search key
  let key = req.query.k;
  try {
    const categories = await Category.find({ name: { $regex: key, $options: 'i' } })
      .limit(5)
      .sort({ post_count: -1 });
    res.json(categories).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occured while fetching categories." });
  }
});

module.exports = router;
