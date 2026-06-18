const attendanceRepository = require('../repositories/attendance.repository');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../helpers/error.helper');

class AttendanceService {
  async markAttendance(userId, status = 'present') {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already marked for today
    const existing = await attendanceRepository.findAll({ userId, date: today });
    if (existing.length > 0) {
      throw new ApiError(400, 'Attendance already marked for today.');
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found.');

    return await attendanceRepository.create({
      userId,
      branchId: user.branchId,
      date: today,
      checkIn: new Date(),
      status
    });
  }

  async markCheckOut(userId) {
    const today = new Date().toISOString().split('T')[0];
    const records = await attendanceRepository.findAll({ userId, date: today });
    
    if (records.length === 0) {
      throw new ApiError(404, 'Attendance record not found for today.');
    }

    return await attendanceRepository.update(records[0].id, { checkOut: new Date() });
  }

  async getUserAttendance(userId, filter = {}) {
    return await attendanceRepository.findAll({ userId, ...filter });
  }

  async getAttendanceList(filter = {}) {
    return await attendanceRepository.findAll(filter);
  }

  async saveAttendance(data) {
    const { userId, date, checkIn, checkOut, status } = data;
    const existing = await attendanceRepository.findAll({ userId, date });
    
    let branchId = null;
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found.');
    branchId = user.branchId;

    if (existing.length > 0) {
      return await attendanceRepository.update(existing[0].id, { checkIn, checkOut, status, branchId });
    } else {
      return await attendanceRepository.create({
        userId,
        branchId,
        date,
        checkIn,
        checkOut,
        status
      });
    }
  }
}

module.exports = new AttendanceService();
