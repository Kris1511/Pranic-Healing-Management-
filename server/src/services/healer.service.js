const healerRepository = require('../repositories/healer.repository');
const ApiError = require('../helpers/error.helper');

class HealerService {
  async registerHealer(data) {
    return await healerRepository.create(data);
  }

  async getAllHealers(filter = {}) {
    return await healerRepository.findAll(filter);
  }

  async getHealerById(id) {
    const healer = await healerRepository.findById(id);
    if (!healer) {
      throw new ApiError(404, 'Healer not found.');
    }
    return healer;
  }

  async updateHealer(id, data) {
    const healer = await healerRepository.update(id, data);
    if (!healer) {
      throw new ApiError(404, 'Healer not found.');
    }
    return healer;
  }

  async deleteHealer(id) {
    const healer = await healerRepository.delete(id);
    if (!healer) {
      throw new ApiError(404, 'Healer not found.');
    }
    return healer;
  }
}

module.exports = new HealerService();
