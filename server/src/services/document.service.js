const documentRepository = require('../repositories/document.repository');
const patientRepository = require('../repositories/patient.repository');
const ApiError = require('../helpers/error.helper');
const path = require('path');
const fs = require('fs');

class DocumentService {
  async uploadDocument(patientId, fileData, fileType) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new ApiError(404, 'Patient not found');
    }

    const { filename, path: tempPath, mimetype } = fileData;
    
    // Create patient folder if it doesn't exist
    const targetDir = path.join(__dirname, '../../src/storage/documents/patients', patientId);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Move file from temp to target directory
    const targetPath = path.join(targetDir, filename);
    await fs.promises.rename(tempPath, targetPath);

    // Save to DB
    const relativePath = `src/storage/documents/patients/${patientId}/${filename}`;
    const document = await documentRepository.create({
      patientId,
      fileName: filename,
      filePath: relativePath,
      fileType,
      mimeType: mimetype
    });

    // Sync path with the corresponding columns in the patients table
    const updateData = {};
    if (fileType === 'MEDICAL_REPORT') updateData.medicalReport = relativePath;
    else if (fileType === 'LAB_REPORT') updateData.labReport = relativePath;
    else if (fileType === 'PRESCRIPTION') updateData.prescription = relativePath;
    else if (fileType === 'ID_PROOF') updateData.idProof = relativePath;

    if (Object.keys(updateData).length > 0) {
      await patientRepository.update(patientId, updateData);
    }

    return document;
  }

  async getPatientDocuments(patientId) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new ApiError(404, 'Patient not found');
    }
    return await documentRepository.findByPatientId(patientId);
  }

  async getAllDocuments(branchId = null) {
    const patientFilter = {};
    if (branchId) {
      patientFilter.branchId = branchId;
    }
    return await documentRepository.findAll({}, patientFilter);
  }

  async getDocumentById(id, branchId = null) {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }
    if (branchId) {
      const patient = await patientRepository.findById(document.patientId);
      if (!patient || patient.branchId !== branchId) {
        throw new ApiError(403, 'Forbidden: You do not have access to this document');
      }
    }
    return document;
  }

  async deleteDocument(id, branchId = null) {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }
    if (branchId) {
      const patient = await patientRepository.findById(document.patientId);
      if (!patient || patient.branchId !== branchId) {
        throw new ApiError(403, 'Forbidden: You do not have access to delete this document');
      }
    }

    // Delete file from disk
    const absolutePath = path.join(__dirname, '../../', document.filePath);
    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }

    // Delete from DB
    await documentRepository.delete(id);
    return true;
  }
}

module.exports = new DocumentService();
