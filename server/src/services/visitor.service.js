const visitorRepository = require('../repositories/visitor.repository');
const ApiError = require('../helpers/error.helper');

class VisitorService {
  async checkInVisitor(data) {
    data.checkIn = new Date();
    return await visitorRepository.create(data);
  }

  async checkOutVisitor(id) {
    const visitor = await visitorRepository.update(id, { checkOut: new Date() });
    if (!visitor) {
      throw new ApiError(404, 'Visitor record not found.');
    }
    return visitor;
  }

  async getVisitorLog(filter = {}) {
    return await visitorRepository.findAll(filter);
  }
}

module.exports = new VisitorService();
