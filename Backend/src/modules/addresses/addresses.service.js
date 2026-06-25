const Address = require('../../models/Address');

exports.getAddresses = async (userId) => {
  return await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
};

exports.createAddress = async (userId, data) => {
  // If isDefault is true, unset default for others
  if (data.isDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  }

  // If this is the user's first address, force it to be default
  const existingCount = await Address.countDocuments({ userId });
  if (existingCount === 0) {
    data.isDefault = true;
  }

  const address = await Address.create({ ...data, userId });
  return address;
};

exports.updateAddress = async (userId, addressId, data) => {
  if (data.isDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  }

  const address = await Address.findOneAndUpdate({ _id: addressId, userId }, data, { new: true });
  if (!address) throw new Error('Address not found or unauthorized');
  
  return address;
};

exports.deleteAddress = async (userId, addressId) => {
  const address = await Address.findOneAndDelete({ _id: addressId, userId });
  if (!address) throw new Error('Address not found or unauthorized');

  // If deleted address was default, set another address as default
  if (address.isDefault) {
    const fallback = await Address.findOne({ userId });
    if (fallback) {
      fallback.isDefault = true;
      await fallback.save();
    }
  }

  return address;
};

exports.setDefaultAddress = async (userId, addressId) => {
  const target = await Address.findOne({ _id: addressId, userId });
  if (!target) throw new Error('Address not found or unauthorized');

  await Address.updateMany({ userId }, { isDefault: false });
  target.isDefault = true;
  await target.save();

  return target;
};
