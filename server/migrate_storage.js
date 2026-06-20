const { sequelize, Document, Patient } = require('./src/models');
const fs = require('fs');
const path = require('path');

async function migrateData() {
  try {
    // 1. Move directories from src/storage/storage/documents/patients/* to src/storage/documents/patients/
    const duplicatePatientsDir = path.join(__dirname, 'src/storage/storage/documents/patients');
    const correctPatientsDir = path.join(__dirname, 'src/storage/documents/patients');

    if (fs.existsSync(duplicatePatientsDir)) {
      const patientFolders = fs.readdirSync(duplicatePatientsDir);
      for (const folder of patientFolders) {
        const oldPath = path.join(duplicatePatientsDir, folder);
        const newPath = path.join(correctPatientsDir, folder);
        
        if (!fs.existsSync(newPath)) {
          fs.mkdirSync(newPath, { recursive: true });
        }
        
        const files = fs.readdirSync(oldPath);
        for (const file of files) {
          fs.renameSync(path.join(oldPath, file), path.join(newPath, file));
        }
      }
    }

    // 2. Remove duplicate structure
    const duplicateStorageDir = path.join(__dirname, 'src/storage/storage');
    if (fs.existsSync(duplicateStorageDir)) {
      fs.rmSync(duplicateStorageDir, { recursive: true, force: true });
    }

    // 3. Update Document table
    const documents = await Document.findAll();
    for (const doc of documents) {
      if (doc.filePath.startsWith('storage/')) {
        doc.filePath = doc.filePath.replace('storage/', 'src/storage/');
        await doc.save();
      }
    }

    // 4. Update Patient table
    const patients = await Patient.findAll();
    for (const patient of patients) {
      let changed = false;
      const columns = ['medicalReport', 'labReport', 'prescription', 'idProof'];
      
      for (const col of columns) {
        if (patient[col] && patient[col].startsWith('storage/')) {
          patient[col] = patient[col].replace('storage/', 'src/storage/');
          changed = true;
        }
      }
      
      if (changed) {
        await patient.save();
      }
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrateData();
