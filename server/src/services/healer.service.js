const healerRepository = require('../repositories/healer.repository');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../helpers/error.helper');
const crypto = require('crypto');
const userService = require('./user.service');
const logger = require('../config/logger.config');
const { admin } = require('../config/firebase.config');

class HealerService {
  async registerHealer(data) {
    if (!data.password) {
      data.password = crypto.randomBytes(4).toString('hex');
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

  async getHealerById(id, branchId) {
    const healer = await healerRepository.findById(id);
    if (!healer) {
      throw new ApiError(404, 'Healer not found.');
    }
    if (branchId && healer.branchId !== branchId) {
      throw new ApiError(403, 'Unauthorized access to branch data.');
    }
    return healer;
  }

  async updateHealer(id, data, branchId) {
    const existing = await this.getHealerById(id, branchId);
    const healer = await healerRepository.update(existing.id, data);

    // Sync to users table
    if (existing.email) {
      try {
        const user = await userRepository.findByEmail(existing.email);
        if (user) {
          const userUpdates = {};
          if (data.name !== undefined) userUpdates.name = data.name;
          if (data.email !== undefined) userUpdates.email = data.email;
          if (data.password !== undefined) userUpdates.password = data.password;
          if (data.mobile !== undefined || data.phone !== undefined) {
            userUpdates.phoneNumber = data.mobile || data.phone;
          }
          if (data.status !== undefined) {
            userUpdates.status = data.status.toLowerCase() === 'active' ? 'active' : 'inactive';
          }
          if (data.branchId !== undefined) userUpdates.branchId = data.branchId;

          // Update Firebase User if password or email is changed
          if (data.password || (data.email && data.email !== user.email)) {
            const { admin } = require('../config/firebase.config');
            if (admin && admin.apps && admin.apps.length > 0) {
              try {
                const firebaseUpdates = {};
                if (data.email) firebaseUpdates.email = data.email;
                if (data.password) firebaseUpdates.password = data.password;

                if (user.firebaseUid) {
                  await admin.auth().updateUser(user.firebaseUid, firebaseUpdates);
                }
              } catch (fbError) {
                console.error('Firebase user update error:', fbError);
              }
            }
          }

          await user.update(userUpdates);
        }
      } catch (userErr) {
        console.error(`Error updating user record for healer: ${userErr.message}`);
      }
    }

    return healer;
  }

  async deleteHealer(id, branchId) {
    // 1. Resolve the healer record (supports both UUID and public healerId)
    const existing = await this.getHealerById(id, branchId);

    // 2. Delete the linked Firebase Auth account (best-effort)
    if (existing.email) {
      try {
        if (admin && admin.apps && admin.apps.length > 0) {
          const fbUser = await admin.auth().getUserByEmail(existing.email);
          await admin.auth().deleteUser(fbUser.uid);
          logger.info(`Firebase account deleted for healer email: ${existing.email}`);
        }
      } catch (fbErr) {
        // Not fatal — log and continue
        logger.warn(`Could not delete Firebase account for ${existing.email}: ${fbErr.message}`);
      }
    }

    // 3. Delete the linked user record from the users table
    if (existing.email) {
      try {
        const deleted = await userRepository.deleteByEmail(existing.email);
        if (deleted) {
          logger.info(`User record deleted for healer email: ${existing.email}`);
        } else {
          logger.warn(`No user record found for healer email: ${existing.email}`);
        }
      } catch (userErr) {
        // Not fatal — log and continue so the healer row still gets removed
        logger.error(`Error deleting user record for healer email ${existing.email}: ${userErr.message}`);
      }
    }

    // 4. Delete the healer record
    const healer = await healerRepository.delete(existing.id);
    return healer;
  }
}

module.exports = new HealerService();
