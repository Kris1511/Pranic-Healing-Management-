const visitorService = require('../services/visitor.service');
const { sendResponse } = require('../helpers/response.helper');

class VisitorController {
  checkIn = async (req, res) => {
    const visitor = await visitorService.checkInVisitor(req.body);
    return sendResponse(res, 201, 'Visitor checked in successfully', visitor);
  };

  checkOut = async (req, res) => {
    const visitor = await visitorService.checkOutVisitor(req.params.id);
    return sendResponse(res, 200, 'Visitor checked out successfully', visitor);
  };

  getLog = async (req, res) => {
    const logs = await visitorService.getVisitorLog(req.query);
    return sendResponse(res, 200, 'Visitor logs retrieved successfully', logs);
  };
}

module.exports = new VisitorController();
