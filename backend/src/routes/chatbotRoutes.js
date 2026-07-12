const express = require('express');
const router = express.Router();
const { conversar } = require('../controllers/chatbotController');

router.post('/', conversar);

module.exports = router;