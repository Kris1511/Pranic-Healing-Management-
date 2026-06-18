const express = require('express');
const router = express.Router();
const branchAdminController = require('../controllers/branchAdmin.controller');
const { protect } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles.constant');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const branchAdminValidator = require('../validators/branchAdmin.validator');

// All branch admin routes require authentication and Super Admin authorization
router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

router.route('/')
  .post(upload.single('idProof'), validate(branchAdminValidator.create), branchAdminController.create)
  .get(branchAdminController.getAll);

router.route('/:id')
  .get(branchAdminController.getById)
  .put(upload.single('idProof'), validate(branchAdminValidator.update), branchAdminController.update)
  .delete(branchAdminController.deleteBranchAdmin);

module.exports = router;
