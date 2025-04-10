const express = require("express");
const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const authenticateToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const router = express.Router();

router.get("/", getAllPosts);
router.post("/", authenticateToken, isAdmin, createPost);
router.put("/:id", authenticateToken, isAdmin, updatePost);
router.delete("/:id", authenticateToken, isAdmin, deletePost);

module.exports = router;
