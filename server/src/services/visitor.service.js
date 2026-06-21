const visitorRepository = require('../repositories/visitor.repository');
const ApiError = require('../helpers/error.helper');

class VisitorService {
  async checkInVisitor(data) {
    data.checkIn = new Date();
    const count = await visitorRepository.count();
    data.visitorId = `VIS-${String(count + 1).padStart(4, '0')}`;
    return await visitorRepository.create(data);
  }

  async checkOutVisitor(id, branchId) {
    const existing = await visitorRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Visitor record not found.');
    }
    if (branchId && existing.branchId !== branchId) {
      throw new ApiError(403, 'Unauthorized access to branch data.');
    }
    const visitor = await visitorRepository.update(id, { checkOut: new Date() });
    return visitor;
  }

  async getVisitorLog(filter = {}) {
    return await visitorRepository.findAll(filter);
  }

  async getVisitorDetails(id) {
    const visitor = await visitorRepository.findById(id);
    if (!visitor) {
      throw new ApiError(404, 'Visitor record not found.');
    }
    return visitor;
  }

  async updateVisitor(id, data, branchId) {
    const existing = await visitorRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Visitor record not found.');
    }
    if (branchId && existing.branchId !== branchId) {
      throw new ApiError(403, 'Unauthorized access to branch data.');
    }
    return await visitorRepository.update(id, data);
  }
}

module.exports = new VisitorService();
