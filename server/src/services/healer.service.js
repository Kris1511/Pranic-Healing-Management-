const healerRepository = require('../repositories/healer.repository');
const ApiError = require('../helpers/error.helper');
const crypto = require('crypto');
const userService = require('./user.service');
const logger = require('../config/logger.config');

class HealerService {
  async registerHealer(data) {
    if (!data.password) {
      data.password = crypto.randomBytes(4).toString('hex');
    }
    
    if (!data.username) {
      data.username = data.email || data.mobile || `healer_${crypto.randomBytes(2).toString('hex')}`;
    }

    const newHealer = await healerRepository.create(data);

    try {
      await userService.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'HEALER',
        phoneNumber: data.mobile || data.phone || data.phoneNumber,
        branchId: data.branchId
      });
    } catch (err) {
      logger.error('Failed to create user account for healer, rolling back...', err);
      if (newHealer && newHealer.id) {
        await healerRepository.delete(newHealer.id);
      }
      throw err;
    }

    return newHealer;
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
