const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');
const branchScope = require('../middlewares/branchScope.middleware');

router.use(protect);
router.use(branchScope);

router.post('/process', paymentController.process);
router.get('/', paymentController.getAll);
router.get('/:id', paymentController.getById);

module.exports = router;
