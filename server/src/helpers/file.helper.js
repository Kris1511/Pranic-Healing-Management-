const fs = require('fs');
const path = require('path');
const logger = require('../config/logger.config');

/**
 * @desc    Move file from temp to permanent storage
 */
const moveFile = (oldPath, newPath) => {
  try {
    const dir = path.dirname(newPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.renameSync(oldPath, newPath);
    return true;
  } catch (error) {
    logger.error('Error moving file:', error);
    return false;
  }
};

/**
 * @desc    Delete file from disk
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  moveFile,
  deleteFile,
};
