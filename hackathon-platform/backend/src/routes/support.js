const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// Chat with AI platform support assistant
router.post('/chat', supportController.handleSupportChat);

// Get contextual platform suggestions and quick chips
router.get('/suggestions', supportController.getSupportSuggestions);

module.exports = router;
