const express = require('express');
const router = express.Router();
const healerController = require('../controllers/healer.controller');
const { protect } = require('../middlewares/auth.middleware');
const branchScope = require('../middlewares/branchScope.middleware');
const validate = require('../middlewares/validate.middleware');
const healerValidator = require('../validators/healer.validator');
const upload = require('../middlewares/upload.middleware');

router.use(protect);
router.use(branchScope);

router.route('/')
  .post(
    upload.fields([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'idProof', maxCount: 1 },
      { name: 'certification', maxCount: 1 }
    ]),
    validate(healerValidator.register),
    healerController.register
  )
  .get(healerController.getAll);

router.route('/:id')
  .get(healerController.getById)
  .put(
    upload.fields([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'idProof', maxCount: 1 },
      { name: 'certification', maxCount: 1 }
    ]),
    validate(healerValidator.update),
    healerController.update
  )
  .delete(healerController.delete);

module.exports = router;