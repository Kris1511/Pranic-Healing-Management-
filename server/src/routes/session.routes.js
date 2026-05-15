const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.route('/')
  .post(sessionController.create)
  .get(sessionController.getAll);

router.route('/:id')
  .get(sessionController.getById)
  .put(sessionController.update)
  .delete(sessionController.delete);

module.exports = router;
