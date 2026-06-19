const documentService = require('../services/document.service');
const { sendResponse } = require('../helpers/response.helper');
const path = require('path');
const fs = require('fs');

class DocumentController {
  upload = async (req, res) => {
    if (!req.file) {
      return sendResponse(res, 400, 'No file uploaded');
    }

    const { patientId, fileType } = req.body;
    if (!patientId || !fileType) {
      // Clean up uploaded file if validation fails
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        await fs.promises.unlink(req.file.path);
      }
      return sendResponse(res, 400, 'Patient ID and file type are required');
    }

    try {
      const document = await documentService.uploadDocument(patientId, req.file, fileType);
      return sendResponse(res, 201, 'Document uploaded successfully', document);
    } catch (error) {
      // Clean up uploaded file if upload fails
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        await fs.promises.unlink(req.file.path);
      }
      console.error('Upload Error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
  };

  getPatientDocuments = async (req, res) => {
    try {
      const { patientId } = req.params;
      const documents = await documentService.getPatientDocuments(patientId);
      return sendResponse(res, 200, 'Documents retrieved successfully', documents);
    } catch (error) {
      console.error('Get Documents Error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
  };

  getAllDocuments = async (req, res) => {
    try {
      const branchId = req.branchId || null;
      const documents = await documentService.getAllDocuments(branchId);
      return sendResponse(res, 200, 'Documents retrieved successfully', documents);
    } catch (error) {
      console.error('Get All Documents Error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
  };

  download = async (req, res) => {
    try {
      const { id } = req.params;
      const branchId = req.branchId || null;
      const document = await documentService.getDocumentById(id, branchId);
      
      const absolutePath = path.join(__dirname, '../../', document.filePath);
      if (!fs.existsSync(absolutePath)) {
        return sendResponse(res, 404, 'File not found on server');
      }

      res.download(absolutePath, document.fileName);
    } catch (error) {
      console.error('Download Error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const branchId = req.branchId || null;
      await documentService.deleteDocument(id, branchId);
      return sendResponse(res, 200, 'Document deleted successfully');
    } catch (error) {
      console.error('Delete Document Error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
  };
}

module.exports = new DocumentController();
