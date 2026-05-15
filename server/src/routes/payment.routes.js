const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/process', paymentController.process);
router.get('/', paymentController.getAll);
router.get('/:id', paymentController.getById);

module.exports = router;
