const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { protect } = require('../middlewares/auth.middleware');
const branchScope = require('../middlewares/branchScope.middleware');
const validate = require('../middlewares/validate.middleware');
const patientValidator = require('../validators/patient.validator');
const upload = require('../middlewares/upload.middleware');

router.use(protect);
router.use(branchScope);

router.route('/')
  .post(validate(patientValidator.register), patientController.register)
  .get(patientController.getAll);

router.get('/dashboard-stats', patientController.getStats);

router.route('/:id')
  .get(patientController.getById)
  .put(
    upload.fields([
      { name: 'medicalReport', maxCount: 1 },
      { name: 'labReport', maxCount: 1 },
      { name: 'prescription', maxCount: 1 },
      { name: 'idProof', maxCount: 1 }
    ]),
    validate(patientValidator.update),
    patientController.update
  )
  .delete(patientController.delete);

module.exports = router;