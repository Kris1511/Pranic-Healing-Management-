const { admin } = require('../config/firebase.config');
const ApiError = require('../helpers/error.helper');
const logger = require('../config/logger.config');
const userRepository = require('../repositories/user.repository');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log("JWT:", token);
    console.log("Authorization Header:", req.headers.authorization);
    return next(new ApiError(401, 'Not authorized'));
  }
  console.log("JWT:", token);
  console.log("Authorization Header:", req.headers.authorization);

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Fetch user from DB
    const dbUser = await userRepository.findByFirebaseUid(
      decodedToken.uid
    );

    if (!dbUser) {
      return next(new ApiError(401, 'User not found'));
    }

    // Store DB user
    req.user = dbUser;

    next();
  } catch (error) {
    logger.error('Firebase token verification failed:', error);

    return next(
      new ApiError(401, 'Not authorized to access this route')
    );
  }
};

module.exports = {
  protect,
};