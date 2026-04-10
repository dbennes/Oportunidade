const jwt = require('jsonwebtoken');
const config = require('../config/config');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, config.auth.secretKey);
    if (!decoded || !decoded.user) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = decoded.user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
};

const requireSelfOrAdmin = (paramName = 'userId') => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const targetId = req.params[paramName] || req.body[paramName] || req.body._id;
  if (req.user.isAdmin || (targetId && String(req.user._id) === String(targetId))) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden' });
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireSelfOrAdmin,
};
