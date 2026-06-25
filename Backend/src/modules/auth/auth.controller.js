const authService = require('./auth.service');

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.status(200).json({ success: true, ...result });
  } catch (err) { res.status(401).json({ success: false, message: err.message }); }
};

exports.staffLogin = async (req, res, next) => {
  try {
    const result = await authService.staffLogin(req.body.email, req.body.password);
    res.status(200).json({ success: true, ...result });
  } catch (err) { res.status(401).json({ success: false, message: err.message }); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error('Refresh token required');
    const result = await authService.refreshToken(refreshToken);
    res.status(200).json({ success: true, ...result });
  } catch (err) { res.status(401).json({ success: false, message: err.message }); }
};

exports.logout = async (req, res, next) => {
  // Stateless JWT logout is handled on the client by deleting the token.
  // We just return success here.
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user);
    res.status(200).json({ success: true, user });
  } catch (err) { res.status(404).json({ success: false, message: err.message }); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error('Email is required');
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) throw new Error('Email, OTP, and new password are required');
    const result = await authService.resetPassword(email, otp, newPassword);
    res.status(200).json(result);
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) throw new Error('Email and OTP are required');
    const result = await authService.verifyEmail(email, otp);
    res.status(200).json(result);
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.approveSandbox = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error('Email is required');
    const result = await authService.approveSandbox(email);
    res.status(200).json(result);
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};
