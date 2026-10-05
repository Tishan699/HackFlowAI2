const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');

router.get('/', mentorController.getMentors);
router.post('/book', mentorController.bookSession);

module.exports = router;
