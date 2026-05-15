const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const branchRoutes = require('./branch.routes');
const patientRoutes = require('./patient.routes');
const healerRoutes = require('./healer.routes');
const sessionRoutes = require('./session.routes');
const financeRoutes = require('./finance.routes');
const visitorRoutes = require('./visitor.routes');
const attendanceRoutes = require('./attendance.routes');
const paymentRoutes = require('./payment.routes');
const reportRoutes = require('./report.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/patients', patientRoutes);
router.use('/healers', healerRoutes);
router.use('/sessions', sessionRoutes);
router.use('/finance', financeRoutes);
router.use('/visitors', visitorRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
