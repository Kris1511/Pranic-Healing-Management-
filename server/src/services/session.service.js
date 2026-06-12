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

  async getSessionById(id, branchId) {
    const session = await sessionRepository.findById(id);
    if (!session) {
      throw new ApiError(404, 'Session not found.');
    }
    if (branchId && session.branchId !== branchId) {
      throw new ApiError(403, 'Unauthorized access to branch data.');
    }
    return session;
  }

  async updateSession(id, data, branchId) {
    const existing = await this.getSessionById(id, branchId);
    const session = await sessionRepository.update(id, data);
    return session;
  }

  async deleteSession(id, branchId) {
    await this.getSessionById(id, branchId);
    const session = await sessionRepository.delete(id);
    return session;
  }
}

module.exports = new SessionService();
