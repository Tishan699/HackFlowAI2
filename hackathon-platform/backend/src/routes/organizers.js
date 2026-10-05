const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizerController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// Participant application to become verified organizer
router.post('/apply', authMiddleware, organizerController.applyForOrganizer);
router.get('/my-status', authMiddleware, organizerController.getMyStatus);

// Admin review portal
router.get('/applications', authMiddleware, requireRole(['organizer', 'admin']), organizerController.getApplications);
router.post('/applications/:id/review', authMiddleware, requireRole(['organizer', 'admin']), organizerController.reviewApplication);

module.exports = router;
