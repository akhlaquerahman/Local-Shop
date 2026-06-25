const Staff = require('../models/Staff');

exports.requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // If it's the actual SELLER/ADMIN, bypass RBAC
      if (!req.user.isStaff) {
        return next();
      }

      // Staff user checking
      const staff = await Staff.findById(req.user.id);
      if (!staff || staff.status === 'SUSPENDED') {
        return res.status(403).json({ success: false, message: 'Staff account inactive or suspended' });
      }

      // Store Managers no longer bypass explicitly; they must possess the exact permissions.

      // Check if staff has the required permission
      if (!staff.permissions || !staff.permissions.includes(requiredPermission)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Insufficient Permissions' });
      }

      // Validated
      next();
    } catch (err) {
      console.error('[RBAC Middleware] Error:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error checking permissions' });
    }
  };
};
