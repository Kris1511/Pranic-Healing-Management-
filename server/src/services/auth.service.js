const userRepository = require('../repositories/user.repository');
const ApiError = require('../helpers/error.helper');
const { admin } = require('../config/firebase.config');

class AuthService {
  /**
   * @desc    Login/Verify user via Firebase Token
   */
  async verifyUser(firebaseToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      const { uid, email } = decodedToken;

      let user = await userRepository.findByFirebaseUid(uid);

      if (!user) {
        // Return dummy user for frontend development if no user exists in DB
        // But in production, we should throw error or create user
        throw new ApiError(401, 'User not found in system. Please contact administrator.');
      }

      if (user.status !== 'active') {
        throw new ApiError(403, 'Your account is deactivated.');
      }

      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Invalid or expired token.');
    }
  }

  /**
   * @desc    Register user via Firebase Token
   */
  async register(data) {
    const { token, name, role, phoneNumber, branchId } = data;
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid, email } = decodedToken;

      // Check if user already exists
      let existingUser = await userRepository.findByFirebaseUid(uid);
      if (existingUser) {
        throw new ApiError(400, 'User already exists.');
      }

      // Create new user in local DB
      const newUser = await userRepository.create({
        firebaseUid: uid,
        email,
        name,
        role: role || 'user',
        phoneNumber,
        branchId,
        status: 'active'
      });

      return newUser;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Invalid or expired token.');
    }
  }

  /**
   * @desc    Reset password directly for a user by email
   */
  async resetPasswordDirectly(email, newPassword) {
    // 1. Find user in MySQL database
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'No account found with this email address.');
    }

    // 2. Update password in Firebase
    try {
      if (admin && admin.apps && admin.apps.length > 0) {
        await admin.auth().updateUser(user.firebaseUid, {
          password: newPassword,
        });
      } else {
        console.warn('Firebase Admin is not initialized. Skipping Firebase password update (simulated for dev).');
      }
    } catch (error) {
      throw new ApiError(500, `Authentication service error: ${error.message}`);
    }

    return { message: 'Password updated successfully' };
  }

  /**
   * @desc    Get Current User Profile
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    return user;
  }
}

module.exports = new AuthService();
