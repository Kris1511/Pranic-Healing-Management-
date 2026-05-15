const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles.constant');

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN)); // Only admins can see reports

router.get('/summary', reportController.getSummary);
router.get('/growth', reportController.getGrowth);

module.exports = router;
