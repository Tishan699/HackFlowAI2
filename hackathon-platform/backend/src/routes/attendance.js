const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/', attendanceController.getStats);
router.post('/scan', attendanceController.scanQr);

module.exports = router;
