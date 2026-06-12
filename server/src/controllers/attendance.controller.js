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

  saveAttendance = async (req, res) => {
    const attendance = await attendanceService.saveAttendance(req.body);
    return sendResponse(res, 200, 'Attendance saved successfully', attendance);
  };

  getHistory = async (req, res) => {
    let filter = { ...req.query };
    let userId = req.params.userId;
    
    const roleUpper = req.user.role ? req.user.role.toUpperCase() : '';
    if (!userId && (roleUpper === 'USER' || roleUpper === 'HEALER' || roleUpper === 'PATIENT')) {
      userId = req.user.id;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (req.branchId) {
      filter.branchId = req.branchId;
    }

    const history = await attendanceService.getAttendanceList(filter);
    return sendResponse(res, 200, 'Attendance history retrieved successfully', history);
  };
}

module.exports = new AttendanceController();
