const { Healer } = require('../models');

class HealerRepository {
  async create(data) {
  return await Healer.create({
    healerId: `PHMS-H-${Math.floor(10000 + Math.random() * 90000)}`,

    name: data.name,
    gender: data.gender,
    dob: data.dob,

    mobile: data.mobile,
    email: data.email,
    address: data.address,

    username: data.username,
    password: data.password,

    status: data.status,

    certLevel: data.certLevel,
    specialization: data.specialization,
    experience: data.experience,
    languages: data.languages,

    verificationStatus: data.verificationStatus,

    profilePhoto: data.profilePhoto || null,
    idProof: data.idProof || null,
    certification: data.certification || null,

    branchId: data.branchId || null,
  });
}

  async findById(id) {
    return await Healer.findByPk(id, {
      include: ['branch']
    });
  }

  async findAll(filter = {}, options = {}) {
    return await Healer.findAll({
      where: filter,
      ...options,
      include: ['branch']
    });
  }

  async update(id, data) {
    const healer = await Healer.findByPk(id);
    if (!healer) return null;
    return await healer.update(data);
  }

  async delete(id) {
    const healer = await Healer.findByPk(id);
    if (!healer) return null;
    return await healer.destroy();
  }
}

module.exports = new HealerRepository();
