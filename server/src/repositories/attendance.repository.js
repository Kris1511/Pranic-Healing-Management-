const { Attendance } = require('../models');

class AttendanceRepository {
  async create(data) {
    return await Attendance.create(data);
  }

  async findById(id) {
    return await Attendance.findByPk(id, {
      include: ['user']
    });
  }

  async findAll(filter = {}, options = {}) {
    return await Attendance.findAll({
      where: filter,
      ...options,
      include: ['user']
    });
  }

  async update(id, data) {
    const attendance = await Attendance.findByPk(id);
    if (!attendance) return null;
    return await attendance.update(data);
  }

  async delete(id) {
    const attendance = await Attendance.findByPk(id);
    if (!attendance) return null;
    return await attendance.destroy();
  }
}

module.exports = new AttendanceRepository();
