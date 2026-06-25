const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { requireAuth } = require('../../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/staff/login', authController.staffLogin);
router.get('/debug-staff', async (req, res) => {
  try {
    const Staff = require('../../models/Staff');
    const staff = await Staff.findOne({ email: 'manager@gmail.com' });
    res.json({ staff });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.post('/verify-email', authController.verifyEmail);
router.post('/approve-sandbox', authController.approveSandbox);

module.exports = router;

