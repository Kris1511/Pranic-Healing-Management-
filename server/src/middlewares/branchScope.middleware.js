const branchScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Super Admin can access all branch data
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Branch Admin must have branchId
  if (req.user.role === 'BRANCH_ADMIN') {
    if (!req.user.branchId) {
      return res.status(403).json({ message: 'Branch not assigned to this user' });
    }

    req.branchId = req.user.branchId;
    return next();
  }

  return next();
};

module.exports = branchScope;