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
        if (fbError.code === 'auth/email-already-exists') {
          try {
            const fbUser = await admin.auth().getUserByEmail(data.email);
            firebaseUid = fbUser.uid;
          } catch (getFbError) {
            throw new ApiError(500, `Authentication service error (get user): ${getFbError.message}`);
          }
        } else {
          throw new ApiError(500, `Authentication service error: ${fbError.message}`);
        }
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
      status: data.status || 'active',
      password: data.password || null
    });

    // Sync to role-specific tables if created directly
    try {
      if (user.role === 'BRANCH_ADMIN') {
        const { BranchAdmin } = require('../models');
        const existingProfile = await BranchAdmin.findOne({ where: { userId: user.id } });
        if (!existingProfile) {
          await BranchAdmin.create({
            userId: user.id,
            branchId: user.branchId,
            name: user.name,
            email: user.email,
            password: data.password || null,
            phoneNumber: user.phoneNumber,
            status: user.status
          });
        }
      } else if (user.role === 'HEALER') {
        const { Healer } = require('../models');
        const existingProfile = await Healer.findOne({ where: { email: user.email } });
        if (!existingProfile) {
          await Healer.create({
            healerId: `PHMS-H-${Math.floor(10000 + Math.random() * 90000)}`,
            name: user.name,
            email: user.email,
            password: data.password || null,
            mobile: user.phoneNumber,
            branchId: user.branchId,
            status: user.status === 'active' ? 'Active' : 'Inactive'
          });
        }
      } else if (user.role === 'PATIENT') {
        const { Patient } = require('../models');
        const existingProfile = await Patient.findOne({ where: { email: user.email } });
        if (!existingProfile) {
          await Patient.create({
            patientId: `PAT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            name: user.name,
            email: user.email,
            password: data.password || null,
            phone: user.phoneNumber,
            branchId: user.branchId,
            status: user.status
          });
        }
      }
    } catch (syncErr) {
      console.error('Failed to sync role profile during user creation:', syncErr);
    }

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
    
    // Update Firebase User if password or email is changed
    if (data.password || (data.email && data.email !== existing.email)) {
      const { admin } = require('../config/firebase.config');
      if (admin && admin.apps && admin.apps.length > 0) {
        try {
          const firebaseUpdates = {};
          if (data.email) firebaseUpdates.email = data.email;
          if (data.password) firebaseUpdates.password = data.password;

          if (existing.firebaseUid) {
            await admin.auth().updateUser(existing.firebaseUid, firebaseUpdates);
          }
        } catch (fbError) {
          console.error('Firebase user update error:', fbError);
        }
      }
    }

    const updatedUser = await userRepository.update(id, data);
    const userRole = data.role || existing.role;

    // Handle role conversion if the role changed
    if (data.role && data.role !== existing.role) {
      try {
        if (existing.role === 'BRANCH_ADMIN') {
          const { BranchAdmin } = require('../models');
          await BranchAdmin.destroy({ where: { userId: existing.id } });
        } else if (existing.role === 'HEALER') {
          const { Healer } = require('../models');
          await Healer.destroy({ where: { email: existing.email } });
        } else if (existing.role === 'PATIENT') {
          const { Patient } = require('../models');
          await Patient.destroy({ where: { email: existing.email } });
        }
      } catch (roleDelErr) {
        console.error('Failed to delete old role profile during role transition:', roleDelErr);
      }
    }

    // Sync updates to corresponding profile
    try {
      const currentEmail = data.email !== undefined ? data.email : existing.email;
      const currentName = data.name !== undefined ? data.name : existing.name;
      const currentPhone = data.phoneNumber !== undefined ? data.phoneNumber : (data.phone !== undefined ? data.phone : existing.phoneNumber);
      const currentBranch = data.branchId !== undefined ? data.branchId : existing.branchId;
      const currentStatus = data.status !== undefined ? data.status : existing.status;
      const currentPassword = data.password !== undefined ? data.password : existing.password;

      if (userRole === 'BRANCH_ADMIN') {
        const { BranchAdmin } = require('../models');
        const profile = await BranchAdmin.findOne({ where: { userId: id } });
        if (profile) {
          await profile.update({
            name: currentName,
            email: currentEmail,
            phoneNumber: currentPhone,
            branchId: currentBranch,
            status: currentStatus,
            password: currentPassword
          });
        } else {
          await BranchAdmin.create({
            userId: id,
            branchId: currentBranch,
            name: currentName,
            email: currentEmail,
            password: currentPassword,
            phoneNumber: currentPhone,
            status: currentStatus
          });
        }
      } else if (userRole === 'HEALER') {
        const { Healer } = require('../models');
        const profile = await Healer.findOne({ where: { email: existing.email } });
        if (profile) {
          await profile.update({
            name: currentName,
            email: currentEmail,
            mobile: currentPhone,
            branchId: currentBranch,
            status: currentStatus === 'active' ? 'Active' : 'Inactive',
            password: currentPassword
          });
        } else {
          await Healer.create({
            healerId: `PHMS-H-${Math.floor(10000 + Math.random() * 90000)}`,
            name: currentName,
            email: currentEmail,
            password: currentPassword,
            mobile: currentPhone,
            branchId: currentBranch,
            status: currentStatus === 'active' ? 'Active' : 'Inactive'
          });
        }
      } else if (userRole === 'PATIENT') {
        const { Patient } = require('../models');
        const profile = await Patient.findOne({ where: { email: existing.email } });
        if (profile) {
          await profile.update({
            name: currentName,
            email: currentEmail,
            phone: currentPhone,
            branchId: currentBranch,
            status: currentStatus,
            password: currentPassword
          });
        } else {
          await Patient.create({
            patientId: `PAT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            name: currentName,
            email: currentEmail,
            password: currentPassword,
            phone: currentPhone,
            branchId: currentBranch,
            status: currentStatus
          });
        }
      }
    } catch (syncErr) {
      console.error('Failed to sync role profile updates:', syncErr);
    }

    return updatedUser;
  }

  async deleteUser(id, branchId) {
    const user = await this.getUserById(id, branchId);
    
    // Delete linked role-specific profiles
    try {
      if (user.role === 'BRANCH_ADMIN') {
        const { BranchAdmin } = require('../models');
        const profile = await BranchAdmin.findOne({ where: { userId: user.id } });
        if (profile) {
          await profile.destroy();
        }
      } else if (user.role === 'HEALER') {
        const { Healer } = require('../models');
        const profile = await Healer.findOne({ where: { email: user.email } });
        if (profile) {
          await profile.destroy();
        }
      } else if (user.role === 'PATIENT') {
        const { Patient } = require('../models');
        const profile = await Patient.findOne({ where: { email: user.email } });
        if (profile) {
          await profile.destroy();
        }
      }
    } catch (syncErr) {
      console.error('Failed to clean delete role profiles:', syncErr);
    }

    const userObj = await userRepository.delete(id);
    return userObj;
  }
}

module.exports = new UserService();
