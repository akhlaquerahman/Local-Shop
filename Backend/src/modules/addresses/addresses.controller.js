const addressesService = require('./addresses.service');

exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await addressesService.getAddresses(req.user.id);
    res.status(200).json({ success: true, data: addresses });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.createAddress = async (req, res, next) => {
  try {
    const address = await addressesService.createAddress(req.user.id, req.body);
    res.status(201).json({ success: true, data: address });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const address = await addressesService.updateAddress(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: address });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    await addressesService.deleteAddress(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Address deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressesService.setDefaultAddress(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: address });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
