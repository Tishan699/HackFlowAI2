const express = require('express');
const router = express.Router();
const judgeController = require('../controllers/judgeController');
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/authMiddleware');

// Public / Authenticated discovery
router.get('/', judgeController.getJudges);
router.get('/my-status', authMiddleware, judgeController.getMyStatus);

// Participant Judge Application Workflow
router.post('/apply', authMiddleware, judgeController.applyForJudge);

// Organizer Review & Decision Workflow
router.get('/applications', authMiddleware, requireRole(['organizer']), judgeController.getApplications);
router.post('/applications/:id/review', authMiddleware, requireRole(['organizer']), judgeController.reviewApplication);

// Direct Organizer Invitation Workflow
router.post('/invite', authMiddleware, requireRole(['organizer']), judgeController.inviteJudge);
router.post('/invitations/accept', optionalAuth, judgeController.acceptInvitation);

// AI Code & Submission Analysis Tool (AI Detector & Rubric Recommendation)
router.post('/analyze-code', optionalAuth, judgeController.analyzeCode);

// Details by ID (Must be below specific paths)
router.get('/:id', judgeController.getJudgeById);

module.exports = router;
