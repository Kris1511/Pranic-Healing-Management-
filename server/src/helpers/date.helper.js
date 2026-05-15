const dayjs = require('dayjs');

/**
 * @desc    Format date to string
 */
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).format(format);
};

/**
 * @desc    Get start and end of day
 */
const getDayRange = (date) => {
  const start = dayjs(date).startOf('day').toDate();
  const end = dayjs(date).endOf('day').toDate();
  return { start, end };
};

module.exports = {
  formatDate,
  getDayRange,
};
