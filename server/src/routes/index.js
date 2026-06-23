const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const branchRoutes = require('./branch.routes');
const userRoutes = require('./user.routes');
const patientRoutes = require('./patient.routes');
const healerRoutes = require('./healer.routes');
const sessionRoutes = require('./session.routes');
const financeRoutes = require('./finance.routes');
const visitorRoutes = require('./visitor.routes');
const attendanceRoutes = require('./attendance.routes');
const paymentRoutes = require('./payment.routes');
const reportRoutes = require('./report.routes');
const treatmentTypeRoutes = require('./treatmentType.routes');
const branchAdminRoutes = require('./branchAdmin.routes');
const documentRoutes = require('./document.routes');
const feedbackRoutes = require('./feedback.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/healers', healerRoutes);
router.use('/sessions', sessionRoutes);
router.use('/finance', financeRoutes);
router.use('/visitors', visitorRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/treatment-types', treatmentTypeRoutes);
router.use('/branch-admins', branchAdminRoutes);
router.use('/documents', documentRoutes);
router.use('/feedbacks', feedbackRoutes);

const { protect } = require('../middlewares/auth.middleware');
const branchScope = require('../middlewares/branchScope.middleware');
const financeController = require('../controllers/finance.controller');
router.get('/super-admin/dashboard/weekly-finance', protect, branchScope, financeController.getWeeklyFinance);

module.exports = router;
