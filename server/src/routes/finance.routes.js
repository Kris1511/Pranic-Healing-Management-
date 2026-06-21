const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { protect } = require('../middlewares/auth.middleware');
const branchScope = require('../middlewares/branchScope.middleware');

router.use(protect);
router.use(branchScope);

router.post('/', financeController.addTransaction);
router.post('/transaction', financeController.addTransaction);
router.put('/:id', financeController.updateTransaction);
router.put('/transaction/:id', financeController.updateTransaction);
router.delete('/:id', financeController.deleteTransaction);
router.delete('/transaction/:id', financeController.deleteTransaction);
router.get('/super-admin/daily', financeController.getSuperAdminDaily);
router.get('/super-admin/revenue', financeController.getSuperAdminRevenue);
router.get('/super-admin/dashboard-stats', financeController.getSuperAdminDashboardStats);
router.get('/super-admin/dashboard/weekly-finance', financeController.getWeeklyFinance);
router.get('/dashboard-stats', financeController.getDashboardStats);
router.get('/', financeController.getAll);
router.get('/summary', financeController.getSummary);

module.exports = router;
