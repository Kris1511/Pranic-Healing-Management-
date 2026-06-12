const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { protect } = require('../middlewares/auth.middleware');
const branchScope = require('../middlewares/branchScope.middleware');

router.use(protect);
router.use(branchScope);

router.route('/')
  .post(patientController.register)
  .get(patientController.getAll);

router.route('/:id')
  .get(patientController.getById)
  .put(patientController.update)
  .delete(patientController.delete);

module.exports = router;