const { User } = require('../models');

class UserRepository {
  async create(data) {
    return await User.create(data);
  }

  async findById(id) {
    return await User.findByPk(id, {
      include: ['branch']
    });
  }

  async findByEmail(email) {
    return await User.findOne({
      where: { email },
      include: ['branch']
    });
  }

  async findByFirebaseUid(firebaseUid) {
    return await User.findOne({
      where: { firebaseUid },
      include: ['branch']
    });
  }

  async findAll(filter = {}, options = {}) {
    return await User.findAll({
      where: filter,
      ...options,
      include: ['branch']
    });
  }

  async update(id, data) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return await user.update(data);
  }

  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return await user.destroy();
  }
}

module.exports = new UserRepository();
