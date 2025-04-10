const express = require('express');
const { getAllPosts } = require('../controllers/postController');
const router = express.Router();

router.get('/', getAllPosts);

module.exports = router;