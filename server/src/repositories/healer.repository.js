const { Healer } = require('../models');

class HealerRepository {
  async create(data) {
    const sanitize = (val) => (val === '' ? null : val);
    const experienceVal = (data.experience === '' || data.experience === undefined || data.experience === null) ? null : Number(data.experience);
    return await Healer.create({
      healerId: `PHMS-H-${Math.floor(10000 + Math.random() * 90000)}`,

      name: data.name,
      gender: sanitize(data.gender),
      dob: sanitize(data.dob),

      mobile: data.mobile || data.phone || null,
      email: data.email || null,
      address: sanitize(data.address),

      password: data.password || null,

      status: sanitize(data.status) || 'Active',

      certLevel: sanitize(data.certLevel),
      specialization: sanitize(data.specialization),
      experience: experienceVal,
      languages: sanitize(data.languages),

      verificationStatus: sanitize(data.verificationStatus),

      profilePhoto: sanitize(data.profilePhoto),
      idProof: sanitize(data.idProof),
      certification: sanitize(data.certification),

      branchId: sanitize(data.branchId),
    });
  }

  async findById(id) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) {
      return await Healer.findByPk(id, {
        include: ['branch']
      });
    }
    return await Healer.findOne({
      where: { healerId: id },
      include: ['branch']
    });
  }

  async findAll(filter = {}, options = {}) {
    const { Op } = require('sequelize');
    const processedFilter = { ...filter };
    if (processedFilter.status) {
      if (typeof processedFilter.status === 'string') {
        const val = processedFilter.status.toLowerCase();
        processedFilter.status = {
          [Op.in]: [val, val.charAt(0).toUpperCase() + val.slice(1)]
        };
      }
    }
    return await Healer.findAll({
      where: processedFilter,
      ...options,
      include: ['branch']
    });
  }

  async update(id, data) {
    const healer = await Healer.findByPk(id);
    if (!healer) return null;

    const sanitize = (val) => (val === '' ? null : val);
    const updatedData = { ...data };
    if (updatedData.gender !== undefined) updatedData.gender = sanitize(updatedData.gender);
    if (updatedData.dob !== undefined) updatedData.dob = sanitize(updatedData.dob);
    if (updatedData.address !== undefined) updatedData.address = sanitize(updatedData.address);
    if (updatedData.status !== undefined) updatedData.status = sanitize(updatedData.status);
    if (updatedData.certLevel !== undefined) updatedData.certLevel = sanitize(updatedData.certLevel);
    if (updatedData.specialization !== undefined) updatedData.specialization = sanitize(updatedData.specialization);
    if (updatedData.languages !== undefined) updatedData.languages = sanitize(updatedData.languages);
    if (updatedData.verificationStatus !== undefined) updatedData.verificationStatus = sanitize(updatedData.verificationStatus);
    if (updatedData.profilePhoto !== undefined) updatedData.profilePhoto = sanitize(updatedData.profilePhoto);
    if (updatedData.idProof !== undefined) updatedData.idProof = sanitize(updatedData.idProof);
    if (updatedData.certification !== undefined) updatedData.certification = sanitize(updatedData.certification);
    if (updatedData.branchId !== undefined) updatedData.branchId = sanitize(updatedData.branchId);

    if (updatedData.experience !== undefined) {
      updatedData.experience = (updatedData.experience === '' || updatedData.experience === null) ? null : Number(updatedData.experience);
    }

    return await healer.update(updatedData);
  }

  async delete(id) {
    const healer = await Healer.findByPk(id);
    if (!healer) return null;
    return await healer.destroy();
  }
}

module.exports = new HealerRepository();
