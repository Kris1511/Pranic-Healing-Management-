const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const { protect } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles.constant');

router.use(protect); // All branch routes require authentication

router.route('/')
  .post(authorize(ROLES.SUPER_ADMIN), branchController.create)
  .get(branchController.getAll);

router.route('/:id')
  .get(branchController.getById)
  .put(authorize(ROLES.SUPER_ADMIN), branchController.update)
  .delete(authorize(ROLES.SUPER_ADMIN), branchController.delete);

module.exports = router;
