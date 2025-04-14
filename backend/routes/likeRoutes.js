const express = require("express");
const { likePost, unlikePost, getLikesForPost } = require("../controllers/likeController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/:postId", authenticateToken, likePost);
router.delete("/:postId", authenticateToken, unlikePost);
router.get("/:postId", getLikesForPost);

module.exports = router;