const jwt = require('jsonwebtoken');
exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.error(`[Auth] Token missing for ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ success: false, message: 'Unauthorized - Missing Token' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    next();
  } catch (err) {
    console.error(`[Auth] Token invalid for ${req.method} ${req.originalUrl}:`, err.message);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
