const branchAdminRepository = require('../repositories/branchAdmin.repository');
const userService = require('./user.service');
const ApiError = require('../helpers/error.helper');

class BranchAdminService {
  async createBranchAdmin(data) {
    console.log("Validated Data:", data);
    // 1. Create the associated User account first
    const user = await userService.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'BRANCH_ADMIN',
      phone: data.phoneNumber || data.phone || null,
      branchId: data.branchId || null,
    });

    try {
      // 2. Fetch the profile automatically created by User model sync
      let profile = await branchAdminRepository.findByUserId(user.id);
      
      if (!profile) {
        profile = await branchAdminRepository.create({
          userId: user.id,
          branchId: data.branchId,
          name: data.name || null,
          email: data.email || null,
          password: data.password || null,
          phoneNumber: data.phoneNumber || data.phone || null,
          dob: data.dob || null,
          gender: data.gender || null,
          addressLine1: data.addressLine1 || null,
          addressLine2: data.addressLine2 || null,
          city: data.city || null,
          district: data.district || null,
          state: data.state || null,
          pincode: data.pincode || null,
          idProof: data.idProof || null,
          status: 'active',
        });
      } else {
        await profile.update({
          dob: data.dob || null,
          gender: data.gender || null,
          addressLine1: data.addressLine1 || null,
          addressLine2: data.addressLine2 || null,
          city: data.city || null,
          district: data.district || null,
          state: data.state || null,
          pincode: data.pincode || null,
          idProof: data.idProof || null,
        });
      }

      return await branchAdminRepository.findById(profile.id);
    } catch (err) {
      console.error("Validation Error:", err);
      console.error("Error Message:", err.message);
      console.error("Error Stack:", err.stack);
      console.error('Failed to create branch admin profile, rolling back user account...', err);
      if (user && user.id) {
        try {
          await userService.deleteUser(user.id);
        } catch (rollbackErr) {
          console.error("Validation Error:", rollbackErr);
          console.error("Error Message:", rollbackErr.message);
          console.error("Error Stack:", rollbackErr.stack);
          console.error('Rollback of user account failed:', rollbackErr);
        }
      }
      throw err;
    }
  }

  async getBranchAdminById(id) {
    let profile = await branchAdminRepository.findById(id);
    if (!profile) {
      profile = await branchAdminRepository.findByUserId(id);
    }
    if (!profile) {
      throw new ApiError(404, 'Branch Admin profile not found.');
    }

    let healersCount = 0;
    let patientsCount = 0;
    let sessionsCount = 0;
    let totalRevenue = 0;
    let healersList = [];
    let patientsList = [];
    let sessionsList = [];
    let financesList = [];

    if (profile.branchId) {
      const { Healer, Patient, Session, Finance } = require('../models');
      const { Op } = require('sequelize');

      healersCount = await Healer.count({ where: { branchId: profile.branchId } });
      patientsCount = await Patient.count({ where: { branchId: profile.branchId } });
      sessionsCount = await Session.count({ where: { branchId: profile.branchId } });
      
      const revenueSum = await Finance.sum('amount', {
        where: {
          branchId: profile.branchId,
          type: {
            [Op.in]: ['Income', 'income', 'INCOME']
          }
        }
      });
      totalRevenue = parseFloat(revenueSum) || 0;

      healersList = await Healer.findAll({
        where: { branchId: profile.branchId },
        order: [['created_at', 'DESC']]
      });

      patientsList = await Patient.findAll({
        where: { branchId: profile.branchId },
        order: [['created_at', 'DESC']]
      });

      sessionsList = await Session.findAll({
        where: { branchId: profile.branchId },
        include: [
          { model: Patient, as: 'patient' },
          { model: Healer, as: 'healer' }
        ],
        order: [['sessionDate', 'DESC'], ['created_at', 'DESC']]
      });

      financesList = await Finance.findAll({
        where: { branchId: profile.branchId },
        order: [['date', 'DESC'], ['created_at', 'DESC']]
      });
    }

    const profileData = profile.toJSON ? profile.toJSON() : { ...profile };
    profileData.healersCount = healersCount;
    profileData.patientsCount = patientsCount;
    profileData.sessionsCount = sessionsCount;
    profileData.totalRevenue = totalRevenue;
    profileData.healersList = healersList;
    profileData.patientsList = patientsList;
    profileData.sessionsList = sessionsList;
    profileData.financesList = financesList;

    return profileData;
  }

  async getBranchAdminByUserId(userId) {
    return await branchAdminRepository.findByUserId(userId);
  }

  async getAllBranchAdmins(filter = {}) {
    return await branchAdminRepository.findAll(filter);
  }

  async updateBranchAdmin(id, data) {
    let profile = await branchAdminRepository.findById(id);
    if (!profile) {
      profile = await branchAdminRepository.findByUserId(id);
    }
    if (!profile) {
      throw new ApiError(404, 'Branch Admin profile not found.');
    }

    // 1. Update associated User record
    const { User } = require('../models');
    const user = await User.findByPk(profile.userId);
    if (user) {
      const userUpdates = {};
      if (data.name !== undefined) userUpdates.name = data.name;
      if (data.email !== undefined) userUpdates.email = data.email;
      if (data.phone !== undefined) userUpdates.phoneNumber = data.phone;
      if (data.status !== undefined) userUpdates.status = data.status;
      if (data.branchId !== undefined) userUpdates.branchId = data.branchId;
      if (data.password !== undefined) userUpdates.password = data.password;

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

    // 2. Update BranchAdmin Profile record
    const profileUpdates = {};
    if (data.branchId !== undefined) profileUpdates.branchId = data.branchId;
    if (data.name !== undefined) profileUpdates.name = data.name || null;
    if (data.email !== undefined) profileUpdates.email = data.email || null;
    if (data.password !== undefined) profileUpdates.password = data.password || null;
    if (data.phone !== undefined) profileUpdates.phoneNumber = data.phone || null;
    if (data.dob !== undefined) profileUpdates.dob = data.dob || null;
    if (data.gender !== undefined) profileUpdates.gender = data.gender || null;
    if (data.addressLine1 !== undefined) profileUpdates.addressLine1 = data.addressLine1 || null;
    if (data.addressLine2 !== undefined) profileUpdates.addressLine2 = data.addressLine2 || null;
    if (data.city !== undefined) profileUpdates.city = data.city || null;
    if (data.district !== undefined) profileUpdates.district = data.district || null;
    if (data.state !== undefined) profileUpdates.state = data.state || null;
    if (data.pincode !== undefined) profileUpdates.pincode = data.pincode || null;
    if (data.idProof !== undefined) profileUpdates.idProof = data.idProof;
    if (data.status !== undefined) profileUpdates.status = data.status || 'active';

    await profile.update(profileUpdates);

    // 3. Return refreshed profile
    return await branchAdminRepository.findById(profile.id);
  }

  async deleteBranchAdminById(branchAdminId) {
    const { sequelize, User, BranchAdmin } = require('../models');
    
    let branchAdmin = await branchAdminRepository.findById(branchAdminId);
    if (!branchAdmin) {
      branchAdmin = await branchAdminRepository.findByUserId(branchAdminId);
    }
    
    if (!branchAdmin) {
      throw new ApiError(404, 'Branch Admin profile not found.');
    }

    console.log("Branch Admin ID:", branchAdminId);
    console.log("User ID:", branchAdmin.user_id);
    console.log("Deleting from branch_admins...");
    console.log("Deleting from users...");

    const transaction = await sequelize.transaction();

    try {
      await branchAdminRepository.delete(branchAdmin.id, { transaction });

      const userRepository = require('../repositories/user.repository');
      await userRepository.delete(branchAdmin.userId, { transaction });

      // Clean up any other orphan users with role BRANCH_ADMIN
      const activeBranchAdmins = await BranchAdmin.findAll({
        attributes: ['userId'],
        transaction
      });
      const activeUserIds = activeBranchAdmins.map(ba => ba.userId);

      const { Op } = require('sequelize');
      await User.destroy({
        where: {
          role: 'BRANCH_ADMIN',
          id: {
            [Op.notIn]: activeUserIds
          }
        },
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return branchAdmin;
  }

  async deleteBranchAdmin(id) {
    return await this.deleteBranchAdminById(id);
  }
}

module.exports = new BranchAdminService();
