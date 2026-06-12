const sessionService = require('../services/session.service');
const { sendResponse } = require('../helpers/response.helper');

class SessionController {
  create = async (req, res) => {
    if (req.branchId) req.body.branchId = req.branchId;

    // Automatically set healerId if logged-in user is a healer
    if (req.user && req.user.role === 'HEALER') {
      const { Healer } = require('../models');
      const healer = await Healer.findOne({ where: { email: req.user.email } });
      if (healer) {
        req.body.healerId = healer.id;
      }
    }

    const session = await sessionService.createSession(req.body);
    return sendResponse(res, 201, 'Session created successfully', session);
  };

  getAll = async (req, res) => {
    const filter = { ...req.query };
    if (req.branchId) filter.branchId = req.branchId;

    // Restrict sessions to only those assigned to the logged-in healer
    if (req.user && req.user.role === 'HEALER') {
      const { Healer } = require('../models');
      const healer = await Healer.findOne({ where: { email: req.user.email } });
      if (healer) {
        filter.healerId = healer.id;
      } else {
        return sendResponse(res, 200, 'Sessions retrieved successfully', []);
      }
    }

    const sessions = await sessionService.getAllSessions(filter);
    return sendResponse(res, 200, 'Sessions retrieved successfully', sessions);
  };

  getById = async (req, res) => {
    const session = await sessionService.getSessionById(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Session retrieved successfully', session);
  };

  update = async (req, res) => {
    const session = await sessionService.updateSession(req.params.id, req.body, req.branchId);
    return sendResponse(res, 200, 'Session updated successfully', session);
  };

  delete = async (req, res) => {
    await sessionService.deleteSession(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Session deleted successfully');
  };
}

module.exports = new SessionController();
