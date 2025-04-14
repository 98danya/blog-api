const express = require("express");
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const authenticateToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" })

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", authenticateToken, isAdmin, upload.single("image"), createPost);
router.put("/:id", authenticateToken, isAdmin, upload.single("image"), updatePost);
router.delete("/:id", authenticateToken, isAdmin, deletePost);

module.exports = router;
