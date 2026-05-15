const express = require('express');
const router = express.Router();
const healerController = require('../controllers/healer.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.route('/')
  .post(healerController.register)
  .get(healerController.getAll);

router.route('/:id')
  .get(healerController.getById)
  .put(healerController.update)
  .delete(healerController.delete);

module.exports = router;
