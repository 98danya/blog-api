const express = require("express");
const {
  likePost,
  unlikePost,
  getLikesForPost,
  likeComment,
  unlikeComment,
  getLikesForComment,
} = require("../controllers/likeController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/post-likes/:postId", authenticateToken, likePost);
router.delete("/post-likes/:postId", authenticateToken, unlikePost);
router.get("/post-likes/:postId", getLikesForPost);

router.post("/comment-likes/:commentId", authenticateToken, likeComment);
router.delete("/comment-likes/:commentId", authenticateToken, unlikeComment);
router.get("/comment-likes/:commentId", getLikesForComment);

module.exports = router;
