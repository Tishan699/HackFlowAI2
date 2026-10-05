const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeamById);
router.post('/', teamController.createTeam);
router.post('/join', teamController.joinTeam);
router.patch('/:id/checkin', teamController.toggleCheckIn);

module.exports = router;
