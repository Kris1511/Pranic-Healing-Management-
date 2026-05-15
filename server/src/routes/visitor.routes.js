const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitor.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/check-in', visitorController.checkIn);
router.put('/check-out/:id', visitorController.checkOut);
router.get('/log', visitorController.getLog);

module.exports = router;
