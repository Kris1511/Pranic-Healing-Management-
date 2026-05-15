const sessionRepository = require('../repositories/session.repository');
const ApiError = require('../helpers/error.helper');

class SessionService {
  async createSession(data) {
    // Business logic like checking healer availability could go here
    return await sessionRepository.create(data);
  }

  async getAllSessions(filter = {}) {
    return await sessionRepository.findAll(filter);
  }

  async getSessionById(id) {
    const session = await sessionRepository.findById(id);
    if (!session) {
      throw new ApiError(404, 'Session not found.');
    }
    return session;
  }

  async updateSession(id, data) {
    const session = await sessionRepository.update(id, data);
    if (!session) {
      throw new ApiError(404, 'Session not found.');
    }
    return session;
  }

  async deleteSession(id) {
    const session = await sessionRepository.delete(id);
    if (!session) {
      throw new ApiError(404, 'Session not found.');
    }
    return session;
  }
}

module.exports = new SessionService();
