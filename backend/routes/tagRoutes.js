const express = require("express");
const { getAllTags, createTag } = require("../controllers/tagController");
const router = express.Router();

router.get("/", getAllTags);
router.post("/", createTag);

module.exports = router;
