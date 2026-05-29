const branchRepository = require('../repositories/branch.repository');
const userRepository = require('../repositories/user.repository');
const { admin } = require('../config/firebase.config');
const ApiError = require('../helpers/error.helper');
const { v4: uuidv4 } = require('uuid');

class BranchService {
  async createBranch(data) {
    // 1. Check if branch name already exists
    const existing = await branchRepository.findAll({ name: data.name });
    if (existing.length > 0) {
      throw new ApiError(400, 'Branch name already exists.');
    }

    // 2. Check if a user with this email already exists in local DB
    if (data.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ApiError(400, 'A user with this email address already exists.');
      }
    }

    // 3. Create the Firebase User if email & password are provided
    let firebaseUid = `mock-uid-${uuidv4()}`;
    if (data.email && data.password) {
      try {
        if (admin && admin.apps && admin.apps.length > 0) {
          const fbUser = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            displayName: `${data.name} Admin`,
          });
          firebaseUid = fbUser.uid;
        } else {
          console.warn('Firebase Admin is not initialized. Skipping Firebase user registration (simulated for dev).');
        }
      } catch (fbError) {
        throw new ApiError(500, `Authentication service error: ${fbError.message}`);
      }
    }

    // 4. Create the Branch in local DB
    const address = [
      data.addressLine1,
      data.addressLine2,
      data.city,
      data.district,
      data.state,
      data.pincode
    ].filter(Boolean).join(', ');

    const branch = await branchRepository.create({
      name: data.name,
      address: address || data.address || null,
      phone: data.phone,
      email: data.email,
      status: 'active',
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      district: data.district || null,
      state: data.state || null,
      pincode: data.pincode || null,
      details: data.details || null
    });

    // 5. Create the local User (Branch Admin)
    if (data.email) {
      await userRepository.create({
        firebaseUid,
        email: data.email,
        name: `${data.name} Admin`,
        role: 'BRANCH_ADMIN',
        phoneNumber: data.phone,
        branchId: branch.id,
        status: 'active'
      });
    }

    return branch;
  }

  async getAllBranches(filter = {}) {
    return await branchRepository.findAll(filter);
  }

  async getBranchById(id) {
    const branch = await branchRepository.findById(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found.');
    }
    return branch;
  }

  async updateBranch(id, data) {
    const branch = await branchRepository.update(id, data);
    if (!branch) {
      throw new ApiError(404, 'Branch not found.');
    }
    return branch;
  }

  async deleteBranch(id) {
    const branch = await branchRepository.delete(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found.');
    }
    return branch;
  }
}

module.exports = new BranchService();
