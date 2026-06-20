const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { protect } = require('../middlewares/auth.middleware');
const branchScope = require('../middlewares/branchScope.middleware');
const validate = require('../middlewares/validate.middleware');
const sessionValidator = require('../validators/session.validator');

router.use(protect);
router.use(branchScope);

router.route('/')
  .post(validate(sessionValidator.create), sessionController.create)
  .get(sessionController.getAll);

router.get('/dashboard-summary', sessionController.getDashboardSummary);

router.route('/:id')
  .get(sessionController.getById)
  .put(validate(sessionValidator.update), sessionController.update)
  .delete(sessionController.delete);

module.exports = router;
