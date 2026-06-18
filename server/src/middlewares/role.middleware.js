const ApiError = require('../helpers/error.helper');

/**
 * @desc    Grant access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("User:", req.user);
    console.log("Role:", req.user?.role);
    const userRole = req.user && req.user.role ? req.user.role.toUpperCase() : '';
    const upperRoles = roles.map(r => r.toUpperCase());

    if (!req.user || !upperRoles.includes(userRole)) {
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
