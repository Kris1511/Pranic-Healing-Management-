const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const branchScope = require('../middlewares/branchScope.middleware');

router.use(protect); // Require authentication for all document routes

// Get all documents
router.get('/', branchScope, documentController.getAllDocuments);

// Document upload route requires 'file' field in form-data
router.post('/upload', upload.single('file'), documentController.upload);

// Get documents for a specific patient
router.get('/patient/:patientId', documentController.getPatientDocuments);

// Download a specific document
router.get('/:id/download', branchScope, documentController.download);

// Delete a document
router.delete('/:id', branchScope, documentController.delete);

module.exports = router;
