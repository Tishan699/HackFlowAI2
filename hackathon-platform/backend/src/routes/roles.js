const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// Switch active persona — requires authentication, backend validates assignedRoles
router.patch('/switch', authMiddleware, roleController.switchPersona);

// Request a new role (any authenticated user)
router.post('/request', authMiddleware, roleController.requestRole);

// Get current user's own role requests
router.get('/my-requests', authMiddleware, roleController.getMyRoleRequests);

// Admin/Organizer: Get all role requests (optionally filter by ?status=PENDING)
router.get('/requests', authMiddleware, requireRole(['organizer', 'admin']), roleController.getRoleRequests);

// Admin/Organizer: Approve or reject a role request
router.post('/requests/:requestId/review', authMiddleware, requireRole(['organizer', 'admin']), roleController.reviewRoleRequest);

module.exports = router;
