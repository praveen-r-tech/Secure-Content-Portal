// Must run after authenticate + loadUser.
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }
  next();
}

module.exports = { requireAdmin };