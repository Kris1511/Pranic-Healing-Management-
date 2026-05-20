const authService = require('../services/auth.service');
const { sendResponse } = require('../helpers/response.helper');

class AuthController {
  /**
   * @desc    Verify token and login
   */
  login = async (req, res) => {
    const { token } = req.body;
    const user = await authService.verifyUser(token);
    
    return sendResponse(res, 200, 'Login successful', user);
  };

  /**
   * @desc    Register new user
   */
  register = async (req, res) => {
    const user = await authService.register(req.body);
    return sendResponse(res, 201, 'Registration successful', user);
  };

  /**
   * @desc    Forgot/Reset password directly
   */
  forgotPassword = async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.resetPasswordDirectly(email, password);
    return sendResponse(res, 200, 'Password reset successful', result);
  };

  /**
   * @desc    Get current user profile
   */
  getMe = async (req, res) => {
    // req.user is added by protect middleware
    const user = await authService.getProfile(req.user.uid || req.user.id);
    return sendResponse(res, 200, 'Profile retrieved successfully', user);
  };
}

module.exports = new AuthController();
