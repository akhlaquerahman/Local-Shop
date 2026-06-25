const User = require('../../models/User');

exports.getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  return user;
};

exports.updateProfile = async (userId, data) => {
  // Prevent changing sensitive fields
  const allowedUpdates = {
    name: data.name,
    phone: data.phone,
    dob: data.dob,
    gender: data.gender,
    avatarUrl: data.avatarUrl
  };

  // Remove undefined fields
  Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

  const user = await User.findByIdAndUpdate(userId, allowedUpdates, { new: true, runValidators: true });
  if (!user) throw new Error('User not found');
  return user;
};
