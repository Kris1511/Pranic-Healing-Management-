const ApiError = require('../helpers/error.helper');

/**
 * @desc    Grant access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Note: Assuming role is in custom claims or added to req.user during token verification
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`
        )
      );
    }
    next();
  };
};

module.exports = authorize;
