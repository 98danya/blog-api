const express = require('express');
const { getAllComments } = require('../controllers/commentController');
const router = express.Router();

router.get('/', getAllComments);

module.exports = router;