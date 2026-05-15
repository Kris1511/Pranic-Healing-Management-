const sessionService = require('../services/session.service');
const { sendResponse } = require('../helpers/response.helper');

class SessionController {
  create = async (req, res) => {
    const session = await sessionService.createSession(req.body);
    return sendResponse(res, 201, 'Session created successfully', session);
  };

  getAll = async (req, res) => {
    const sessions = await sessionService.getAllSessions(req.query);
    return sendResponse(res, 200, 'Sessions retrieved successfully', sessions);
  };

  getById = async (req, res) => {
    const session = await sessionService.getSessionById(req.params.id);
    return sendResponse(res, 200, 'Session retrieved successfully', session);
  };

  update = async (req, res) => {
    const session = await sessionService.updateSession(req.params.id, req.body);
    return sendResponse(res, 200, 'Session updated successfully', session);
  };

  delete = async (req, res) => {
    await sessionService.deleteSession(req.params.id);
    return sendResponse(res, 200, 'Session deleted successfully');
  };
}

module.exports = new SessionController();
