const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.route('/')
  .post(patientController.register)
  .get(patientController.getAll);

router.route('/:id')
  .get(patientController.getById)
  .put(patientController.update)
  .delete(patientController.delete);

module.exports = router;
