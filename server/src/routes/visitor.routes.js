const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitor.controller');
const { protect } = require('../middlewares/auth.middleware');
const branchScope = require('../middlewares/branchScope.middleware');

router.use(protect);
router.use(branchScope);

router.post('/check-in', visitorController.checkIn);
router.put('/check-out/:id', visitorController.checkOut);
router.get('/log', visitorController.getLog);
router.get('/:id', visitorController.getDetails);
router.put('/:id', visitorController.update);

module.exports = router;
