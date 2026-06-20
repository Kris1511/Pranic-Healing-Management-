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

    const { filename, path: tempPath, mimetype, originalname } = fileData;
    const originalName = originalname || filename;
    
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
      originalName,
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

  async getAllDocuments(options) {
    let branchId = null;
    let userRole = null;
    let userId = null;

    if (typeof options === 'object' && options !== null) {
      branchId = options.branchId;
      userRole = options.userRole;
      userId = options.userId;
    } else {
      branchId = options; // Backward compatibility
    }

    const patientFilter = {};
    if (branchId) {
      patientFilter.branchId = branchId;
    }
    if (userRole === 'healer' || userRole === 'HEALER') {
      const healerRepository = require('../repositories/healer.repository');
      const userRepository = require('../repositories/user.repository');
      const user = await userRepository.findById(userId);
      if (user) {
        const { Healer, sequelize } = require('../models');
        const healer = await Healer.findOne({
          where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('email')),
            user.email.toLowerCase()
          )
        });
        if (healer) {
          patientFilter.healerId = healer.id;
        } else {
          // If no matching healer is found, return empty array by forcing a non-existent healerId
          patientFilter.healerId = '00000000-0000-0000-0000-000000000000';
        }
      }
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

    const patient = await patientRepository.findById(document.patientId);
    if (branchId) {
      if (!patient || patient.branchId !== branchId) {
        throw new ApiError(403, 'Forbidden: You do not have access to delete this document');
      }
    }

    // Delete file from disk
    const absolutePath = path.join(__dirname, '../../', document.filePath);
    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }

    // Sync path with the corresponding columns in the patients table
    if (patient) {
      const updateData = {};
      if (document.fileType === 'MEDICAL_REPORT' && patient.medicalReport === document.filePath) {
        updateData.medicalReport = null;
      } else if (document.fileType === 'LAB_REPORT' && patient.labReport === document.filePath) {
        updateData.labReport = null;
      } else if (document.fileType === 'PRESCRIPTION' && patient.prescription === document.filePath) {
        updateData.prescription = null;
      } else if (document.fileType === 'ID_PROOF' && patient.idProof === document.filePath) {
        updateData.idProof = null;
      }

      if (Object.keys(updateData).length > 0) {
        await patientRepository.update(patient.id, updateData);
      }
    }

    // Delete from DB
    await documentRepository.delete(id);
    return true;
  }
}

module.exports = new DocumentService();
