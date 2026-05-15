const attendanceRepository = require('../repositories/attendance.repository');
const ApiError = require('../helpers/error.helper');

class AttendanceService {
  async markAttendance(userId, status = 'present') {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already marked for today
    const existing = await attendanceRepository.findAll({ userId, date: today });
    if (existing.length > 0) {
      throw new ApiError(400, 'Attendance already marked for today.');
    }

    return await attendanceRepository.create({
      userId,
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
}

module.exports = new AttendanceService();
