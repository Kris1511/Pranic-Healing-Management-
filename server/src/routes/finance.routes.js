const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/transaction', financeController.addTransaction);
router.get('/', financeController.getAll);
router.get('/summary', financeController.getSummary);

module.exports = router;
