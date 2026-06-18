const express = require('express');
const router = express.Router();
const treatmentTypeController = require('../controllers/treatmentType.controller');
const { protect } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles.constant');

router.use(protect); // All treatment type routes require authentication

router.route('/')
  .post(authorize(ROLES.SUPER_ADMIN), treatmentTypeController.create)
  .get(treatmentTypeController.getAll);

router.route('/:id')
  .get(treatmentTypeController.getById)
  .put(authorize(ROLES.SUPER_ADMIN), treatmentTypeController.update)
  .delete(authorize(ROLES.SUPER_ADMIN), treatmentTypeController.delete);

module.exports = router;
