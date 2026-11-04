const propertyOwner = (req, res, next) => {
  if (!req.user || req.user.role !== 'OWNER') {
    return res.status(403).json({ message: 'Property-owner access required.' });
  }
  return next();
};

module.exports = { propertyOwner };
