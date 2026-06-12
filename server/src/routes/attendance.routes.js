const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect } = require('../middlewares/auth.middleware');
const branchScope = require('../middlewares/branchScope.middleware');

router.use(protect);
router.use(branchScope);

router.post('/present', attendanceController.markPresent);
router.post('/out', attendanceController.markOut);
router.post('/save', attendanceController.saveAttendance);
router.get('/history/:userId?', attendanceController.getHistory);

module.exports = router;
