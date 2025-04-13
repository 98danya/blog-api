const express = require("express");
const { login, register, logout, getProfile } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/profile", authenticateToken, getProfile);

module.exports = router;
