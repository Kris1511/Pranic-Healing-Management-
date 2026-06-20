const documentService = require('./src/services/document.service');
const fs = require('fs');

async function testUpload() {
  const patientId = '4748b143-34bb-4226-8bd3-aa0feb4a008e';
  const fileData = {
    filename: 'test-file.pdf',
    path: './test-file.pdf',
    mimetype: 'application/pdf'
  };

  fs.writeFileSync('./test-file.pdf', 'dummy content');

  try {
    const res = await documentService.uploadDocument(patientId, fileData, 'MEDICAL_REPORT');
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }
}

testUpload();
