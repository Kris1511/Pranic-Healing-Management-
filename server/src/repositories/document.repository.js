const { Document, Patient } = require('../models');

class DocumentRepository {
  async create(data) {
    return await Document.create(data);
  }

  async findById(id) {
    return await Document.findByPk(id);
  }

  async findByPatientId(patientId) {
    return await Document.findAll({
      where: { patientId },
      order: [['createdAt', 'DESC']]
    });
  }

  async findAll(filter = {}, patientFilter = null) {
    const include = {
      model: Patient,
      as: 'patient'
    };
    if (patientFilter && Object.keys(patientFilter).length > 0) {
      include.where = patientFilter;
    }
    return await Document.findAll({
      where: filter,
      include: [include],
      order: [['createdAt', 'DESC']]
    });
  }

  async delete(id) {
    const document = await Document.findByPk(id);
    if (!document) return null;
    return await document.destroy();
  }
}

module.exports = new DocumentRepository();
