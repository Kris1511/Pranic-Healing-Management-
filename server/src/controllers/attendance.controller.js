const attendanceService = require('../services/attendance.service');
const { sendResponse } = require('../helpers/response.helper');

class AttendanceController {
  markPresent = async (req, res) => {
    // Usually userId comes from auth middleware req.user
    const attendance = await attendanceService.markAttendance(req.user.id || req.body.userId);
    return sendResponse(res, 201, 'Attendance marked successfully', attendance);
  };

  markOut = async (req, res) => {
    const attendance = await attendanceService.markCheckOut(req.user.id || req.body.userId);
    return sendResponse(res, 200, 'Check-out marked successfully', attendance);
  };

  getHistory = async (req, res) => {
    const userId = req.params.userId || req.user.id;
    const history = await attendanceService.getUserAttendance(userId, req.query);
    return sendResponse(res, 200, 'Attendance history retrieved successfully', history);
  };
}

module.exports = new AttendanceController();
