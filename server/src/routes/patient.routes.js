const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { protect } = require('../middlewares/auth.middleware');
const branchScope = require('../middlewares/branchScope.middleware');
const validate = require('../middlewares/validate.middleware');
const patientValidator = require('../validators/patient.validator');

router.use(protect);
router.use(branchScope);

router.route('/')
  .post(validate(patientValidator.register), patientController.register)
  .get(patientController.getAll);

router.route('/:id')
  .get(patientController.getById)
  .put(validate(patientValidator.update), patientController.update)
  .delete(patientController.delete);

module.exports = router;