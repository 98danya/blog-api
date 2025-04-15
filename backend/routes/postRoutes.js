const express = require("express");
const {
  getAllPosts,
  getPosts,
  getPostById,
  createPost,
  publishPost,
  unpublishPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const authenticateToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/", getPosts);
router.get("/all", authenticateToken, isAdmin, getAllPosts);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.post(
  "/",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  createPost
);
router.post("/:id/publish", authenticateToken, isAdmin, publishPost);
router.patch("/:id/unpublish", authenticateToken, isAdmin, unpublishPost);
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  updatePost
);
router.delete("/:id", authenticateToken, isAdmin, deletePost);

module.exports = router;