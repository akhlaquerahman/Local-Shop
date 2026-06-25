const PaymentMethod = require('../../models/PaymentMethod');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id || req.user.userId) : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let payments = await PaymentMethod.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id || req.user.userId) : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const data = { ...req.body, userId };
    if (data.isDefault) {
      await PaymentMethod.updateMany({ userId }, { isDefault: false });
    }
    const payment = new PaymentMethod(data);
    await payment.save();
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await PaymentMethod.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Payment method deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.setDefault = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id || req.user.userId) : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await PaymentMethod.updateMany({ userId }, { isDefault: false });
    const payment = await PaymentMethod.findByIdAndUpdate(req.params.id, { isDefault: true }, { new: true });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
