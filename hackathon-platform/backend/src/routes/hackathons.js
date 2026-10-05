const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/authMiddleware');

// Public or Organizer-scoped browsing
router.get('/', optionalAuth, hackathonController.getAll);

// Admin review queue for sensitive changes (must be defined before /:id)
router.get('/changes/pending', authMiddleware, requireRole(['organizer', 'admin']), hackathonController.getPendingChanges);
router.post('/changes/:changeId/review', authMiddleware, requireRole(['organizer', 'admin']), hackathonController.reviewChange);

// Single event discovery
router.get('/:id', optionalAuth, hackathonController.getById);

// Event change audit trail
router.get('/:id/changes', optionalAuth, hackathonController.getChangeHistory);

// Event creation, editing with field-level restrictions, and lifecycle state management
router.post('/', authMiddleware, requireRole(['organizer', 'admin']), hackathonController.create);
router.put('/:id', authMiddleware, requireRole(['organizer', 'admin']), hackathonController.update);
router.patch('/:id/state', authMiddleware, requireRole(['organizer', 'admin']), hackathonController.updateState);
router.delete('/:id', authMiddleware, requireRole(['organizer', 'admin']), hackathonController.delete);

module.exports = router;
