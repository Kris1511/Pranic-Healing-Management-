const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/present', attendanceController.markPresent);
router.post('/out', attendanceController.markOut);
router.get('/history/:userId?', attendanceController.getHistory);

module.exports = router;
