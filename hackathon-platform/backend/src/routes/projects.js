const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { upload } = require('../middleware/uploadMiddleware');
const { authMiddleware, requireHackathonRole } = require('../middleware/authMiddleware');

router.get('/', projectController.getProjects);
router.get('/stats', projectController.getStats);
router.get('/:id', projectController.getProjectById);

// Multipart file upload with 20MB limit for PDFs, pitch decks, and deliverables
router.post('/upload', (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File size exceeds the 20MB maximum limit. Please choose files smaller than 20MB.'
        });
      }
      return res.status(400).json({
        error: err.message || 'Failed to upload file deliverable.'
      });
    }
    projectController.uploadFiles(req, res);
  });
});

router.post('/', projectController.submitProject);

// RBAC Protected: Only verified Judges or Organizers for this hackathon can submit scores
router.post('/:id/score', authMiddleware, requireHackathonRole(['JUDGE', 'ORGANIZER']), projectController.scoreProject);

module.exports = router;
