const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'supersecretrefresh';

exports.register = async (data) => {
  if (data.role === 'SUPER_ADMIN') throw new Error('Forbidden to register as Super Admin');
  
  const existingUser = await User.findOne({ $or: [{ email: data.email }, { phone: data.phone }] });
  if (existingUser) throw new Error('Email or phone already exists');

  const hashed = await bcrypt.hash(data.password, 10);
  let status = 'ACTIVE';
  if (data.role === 'SELLER') status = 'PENDING_VERIFICATION';
  if (data.role === 'DELIVERY_PARTNER') status = 'PENDING_KYC';
  
  const user = await User.create({ ...data, password: hashed, status });

  if (data.role === 'SELLER') {
    const Shop = require('../../models/Shop');
    const shopName = data.shopName || `${data.name}'s Shop`;
    const shopSlug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + user._id.toString().substring(0, 4);
    const shop = await Shop.create({
      name: shopName,
      owner: user._id,
      slug: shopSlug,
      category: data.businessType || 'General',
      status: 'pending_approval'
    });
    user.shopId = shop._id;
    await user.save();
  }
  
  const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: user._id, role: user.role }, REFRESH_SECRET, { expiresIn: '7d' });
  
  return { user, token, refreshToken };
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Check if it's an Admin Agent
    const AdminAgent = require('../../models/AdminAgent');
    const agent = await AdminAgent.findOne({ email }).select('+password');
    
    if (agent && (await bcrypt.compare(password, agent.password))) {
      if (agent.status === 'SUSPENDED') throw new Error('Account suspended');
      agent.lastLogin = new Date();
      await agent.save();
      
      const token = jwt.sign({ id: agent._id, role: 'SUPER_ADMIN', name: agent.fullName, isAgent: true, accountType: 'ADMIN_AGENT' }, JWT_SECRET, { expiresIn: '1d' });
      const refreshToken = jwt.sign({ id: agent._id, role: 'SUPER_ADMIN', isAgent: true, accountType: 'ADMIN_AGENT' }, REFRESH_SECRET, { expiresIn: '7d' });
      
      const userObj = { ...agent.toObject(), isAgent: true, role: 'SUPER_ADMIN', id: agent._id, accountType: 'ADMIN_AGENT' };
      delete userObj.password;
      
      return { user: userObj, token, refreshToken };
    }
    
    throw new Error('Invalid credentials');
  }

  if (user.status === 'SUSPENDED') throw new Error('Account suspended');
  
  const token = jwt.sign({ id: user._id, role: user.role, name: user.name, accountType: user.role === 'SELLER' ? 'SELLER_OWNER' : undefined }, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: user._id, role: user.role, accountType: user.role === 'SELLER' ? 'SELLER_OWNER' : undefined }, REFRESH_SECRET, { expiresIn: '7d' });
  
  return { user, token, refreshToken };
};

exports.staffLogin = async (email, password) => {
  const Staff = require('../../models/Staff');
  const StaffRole = require('../../models/StaffRole');
  const staff = await Staff.findOne({ email }).select('+password');
  if (!staff || !(await bcrypt.compare(password, staff.password))) throw new Error('Invalid credentials');
  if (staff.status === 'SUSPENDED') throw new Error('Account suspended');
  
  // Auto-migrate legacy staff if roleId is missing
  if (!staff.roleId && staff.role) {
    const roleName = staff.role.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    const matchedRole = await StaffRole.findOne({ shopId: staff.shopId, name: roleName, isSystem: true });
    
    if (matchedRole) {
      staff.roleId = matchedRole._id;
      staff.effectivePermissions = matchedRole.permissions;
    }
  }

  staff.lastLogin = new Date();
  await staff.save();
  
  const token = jwt.sign({ id: staff._id, role: staff.role, name: staff.fullName, isStaff: true, shopId: staff.shopId, accountType: 'SELLER_STAFF' }, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: staff._id, role: staff.role, isStaff: true, accountType: 'SELLER_STAFF' }, REFRESH_SECRET, { expiresIn: '7d' });
  
  const userObj = { ...staff.toObject(), isStaff: true, id: staff._id };
  delete userObj.password;
  
  return { user: userObj, token, refreshToken };
};

exports.refreshToken = async (token) => {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.status === 'SUSPENDED') throw new Error('Invalid user or suspended');
    
    const newToken = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    const newRefreshToken = jwt.sign({ id: user._id, role: user.role }, REFRESH_SECRET, { expiresIn: '7d' });
    
    return { token: newToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw new Error('Invalid refresh token');
  }
};

exports.getMe = async (reqUser) => {
  if (reqUser.isAgent || reqUser.accountType === 'ADMIN_AGENT') {
    const AdminAgent = require('../../models/AdminAgent');
    const agent = await AdminAgent.findById(reqUser.id || reqUser._id).populate('roleId');
    if (!agent) throw new Error('Agent account not found');
    
    const agentObj = { 
      ...agent.toObject(), 
      isAgent: true, 
      role: 'SUPER_ADMIN',
      name: agent.fullName,
      id: agent._id, 
      accountType: 'ADMIN_AGENT',
      effectivePermissions: agent.roleId ? agent.roleId.permissions : agent.effectivePermissions
    };
    delete agentObj.password;
    return agentObj;
  }

  if (reqUser.isStaff || reqUser.accountType === 'SELLER_STAFF') {
    const Staff = require('../../models/Staff');
    const StaffRole = require('../../models/StaffRole');
    const staff = await Staff.findById(reqUser.id || reqUser._id);
    if (!staff) throw new Error('Staff account not found');
    
    // Auto-migrate legacy staff if roleId is missing
    if (!staff.roleId && staff.role) {
      const roleName = staff.role.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
      const matchedRole = await StaffRole.findOne({ shopId: staff.shopId, name: roleName, isSystem: true });
      
      if (matchedRole) {
        staff.roleId = matchedRole._id;
        staff.effectivePermissions = matchedRole.permissions;
        await staff.save();
      }
    }

    const staffObj = { 
      ...staff.toObject(), 
      isStaff: true, 
      id: staff._id, 
      accountType: 'SELLER_STAFF' 
    };
    delete staffObj.password;
    return staffObj;
  }

  const userId = reqUser.id || reqUser._id || reqUser;
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Auto-repair missing shop for sellers
  if (user.role === 'SELLER' && !user.shopId) {
    const Shop = require('../../models/Shop');
    let shop = await Shop.findOne({ owner: user._id });
    if (!shop) {
      const shopSlug = (user.shopName || `Shop ${user.name}`).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + user._id.toString().substring(0, 4);
      shop = new Shop({
        name: user.shopName || `Shop ${user.name}`,
        slug: shopSlug,
        owner: user._id,
        category: user.businessType || 'General',
        status: 'active',
        isFeatured: true
      });
      await shop.save();
    } else {
      shop.isFeatured = true;
      await shop.save();
    }
    user.shopId = shop._id;
    await user.save();
    
    // Also fix products uploaded without Deal/Recommended flags so they appear on home
    const Product = require('../../models/Product');
    await Product.updateMany(
      { $or: [{ shopId: shop._id }, { owner: user._id }] }, // Just in case
      { $set: { isDeal: true, isRecommended: true, status: 'ACTIVE', shopId: shop._id } }
    );
  }

  const userObj = { 
    ...user.toObject(), 
    id: user._id, 
    accountType: user.role === 'SELLER' ? 'SELLER_OWNER' : undefined 
  };
  delete userObj.password;
  
  return userObj;
};


exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User with this email does not exist');
  
  // In a real system, we'd generate a token and send an email here.
  // We'll return success so the frontend knows to proceed to the OTP step.
  return { success: true, message: 'OTP sent to email' };
};

exports.resetPassword = async (email, otp, newPassword) => {
  if (otp !== '123456') throw new Error('Invalid verification code');

  const user = await User.findOne({ email });
  if (!user) throw new Error('User with this email does not exist');

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  return { success: true, message: 'Password has been reset successfully' };
};

exports.verifyEmail = async (email, otp) => {
  if (otp !== '123456') throw new Error('Invalid verification code');

  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  if (user.role === 'SELLER' || user.role === 'DELIVERY_PARTNER') {
    user.status = 'PENDING_KYC';
  } else {
    user.status = 'ACTIVE';
  }

  await user.save();
  return { success: true, message: 'Email verified successfully', user };
};

exports.approveSandbox = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  user.status = 'ACTIVE';
  await user.save();
  return { success: true, message: 'Account approved successfully', user };
};

