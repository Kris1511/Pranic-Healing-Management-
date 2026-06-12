const userRepository = require('../repositories/user.repository');
const ApiError = require('../helpers/error.helper');
const { admin } = require('../config/firebase.config');
const { v4: uuidv4 } = require('uuid');

const credentialService = require('./credential.service');

class UserService {
  async createUser(data) {
    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(400, 'A user with this email address already exists.');
    }

    // 2. Create the Firebase User if email & password are provided
    let firebaseUid = `mock-uid-${uuidv4()}`;
    if (data.email && data.password) {
      try {
        if (admin && admin.apps && admin.apps.length > 0) {
          const fbUser = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            displayName: data.name,
          });
          firebaseUid = fbUser.uid;
        } else {
          console.warn('Firebase Admin is not initialized. Skipping Firebase user registration (simulated for dev).');
        }
      } catch (fbError) {
        throw new ApiError(500, `Authentication service error: ${fbError.message}`);
      }
    }

    // 3. Create user in local DB
    const user = await userRepository.create({
      firebaseUid,
      email: data.email,
      name: data.name,
      role: data.role || 'BRANCH_ADMIN',
      phoneNumber: data.phoneNumber || data.phone || null,
      branchId: data.branchId || null,
      status: 'active'
    });

    // 4. Send Credentials via Email and SMS
    if (data.email && data.password) {
      // Execute asynchronously, don't wait for completion to speed up the API response
      credentialService.sendCredentials(user, data.password).catch(err => {
        console.error('Error sending credential email:', err);
      });
      
      credentialService.sendSMS(user, data.password).catch(err => {
        console.error('Error sending credential SMS:', err);
      });
    }

    return user;
  }

  async getAllUsers(filter = {}) {
    return await userRepository.findAll(filter);
  }

  async getUserById(id, branchId) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    if (branchId && user.branchId !== branchId) {
      throw new ApiError(403, 'Unauthorized access to branch data.');
    }
    return user;
  }

  async updateUser(id, data, branchId) {
    const existing = await this.getUserById(id, branchId);
    const user = await userRepository.update(id, data);
    return user;
  }

  async deleteUser(id, branchId) {
    await this.getUserById(id, branchId);
    const user = await userRepository.delete(id);
    return user;
  }
}

module.exports = new UserService();
