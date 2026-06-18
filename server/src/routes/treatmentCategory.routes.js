const express = require('express');
const router = express.Router();
const treatmentCategoryController = require('../controllers/treatmentCategory.controller');
const { protect } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles.constant');

router.use(protect); // All treatment category routes require authentication

router.route('/')
  .post(authorize(ROLES.SUPER_ADMIN), treatmentCategoryController.create)
  .get(treatmentCategoryController.getAll);

router.route('/:id')
  .get(treatmentCategoryController.getById)
  .put(authorize(ROLES.SUPER_ADMIN), treatmentCategoryController.update)
  .delete(authorize(ROLES.SUPER_ADMIN), treatmentCategoryController.delete);

module.exports = router;
