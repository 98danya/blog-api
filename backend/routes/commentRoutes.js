const express = require("express");
const {
  getAllComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", getAllComments);
router.post("/", createComment);

router.put("/:id", authenticateToken, updateComment);
router.delete("/:id", authenticateToken, deleteComment);

module.exports = router;