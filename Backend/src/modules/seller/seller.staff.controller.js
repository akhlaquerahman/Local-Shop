const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Staff = require('../../models/Staff');
const User = require('../../models/User');

const getSellerShopId = async (reqUser) => {
  if (reqUser.accountType === 'SELLER_STAFF' || reqUser.isStaff) return reqUser.shopId;
  const user = await User.findById(reqUser.id || reqUser._id);
  if (!user || !user.shopId) throw new Error('Seller shop not found');
  return user.shopId;
};

exports.getStaffList = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const staff = await Staff.find({ shopId: shopId }).sort({ createdAt: -1 });

    const stats = await Staff.aggregate([
      { $match: { shopId: new mongoose.Types.ObjectId(shopId.toString()) } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'INVITED'] }, 1, 0] } }
      }}
    ]);

    const dataStats = stats[0] || { total: 0, active: 0, pending: 0 };

    res.json({ success: true, data: { staff, stats: dataStats } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { fullName, email, phone, password, age, gender, dateOfJoining, roleId, role, customAddedPermissions = [], customRemovedPermissions = [], status } = req.body;

    const existingStaff = await Staff.findOne({ $or: [{ email }, { phone }] });
    if (existingStaff) {
      return res.status(400).json({ success: false, message: 'Email or phone already in use by another staff' });
    }

    const employeeCode = `EMP-${Date.now().toString().slice(-6)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Resolve Role and compute effective permissions
    let basePermissions = [];
    if (roleId) {
      const StaffRole = require('../../models/StaffRole');
      const assignedRole = await StaffRole.findById(roleId);
      if (assignedRole && assignedRole.shopId.toString() === shopId.toString()) {
        basePermissions = assignedRole.permissions || [];
      } else {
        return res.status(400).json({ success: false, message: 'Invalid role assignment' });
      }
    } else {
      // Legacy fallback (should ideally be migrated)
      basePermissions = [];
    }

    const effective = new Set([...basePermissions, ...customAddedPermissions]);
    customRemovedPermissions.forEach(p => effective.delete(p));

    const staff = new Staff({
      shopId,
      sellerId: req.user.id || req.user._id,
      employeeCode,
      fullName,
      email,
      phone,
      password: hashedPassword,
      age,
      gender,
      dateOfJoining,
      roleId,
      role, // keep legacy field for now
      effectivePermissions: Array.from(effective),
      customAddedPermissions,
      customRemovedPermissions,
      permissions: Array.from(effective), // Backwards compatibility
      status: status || 'ACTIVE',
      createdBy: req.user.id || req.user._id
    });
    
    await staff.save();
    
    const staffObj = staff.toObject();
    delete staffObj.password;
    
    res.status(201).json({ success: true, data: staffObj, message: 'Staff account created successfully' });
  } catch (err) {
    console.error('STAFF CREATE ERROR:', err);
    let errorMessage = err.message;
    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(val => val.message).join(', ');
    }
    res.status(400).json({ success: false, message: errorMessage });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const staff = await Staff.findOne({ _id: req.params.id, shopId: shopId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    const updates = { ...req.body };
    delete updates.password; // Do not update password directly here
    
    // If roles or permissions are updated, re-calculate effective permissions
    let needsPermissionUpdate = false;
    let basePermissions = staff.effectivePermissions || staff.permissions || [];
    
    if ('roleId' in updates) {
      if (updates.roleId) {
        const StaffRole = require('../../models/StaffRole');
        const assignedRole = await StaffRole.findById(updates.roleId);
        if (assignedRole && assignedRole.shopId.toString() === shopId.toString()) {
          basePermissions = assignedRole.permissions || [];
          needsPermissionUpdate = true;
        } else {
          return res.status(400).json({ success: false, message: 'Invalid role assignment' });
        }
      }
    }
    
    if ('customAddedPermissions' in updates || 'customRemovedPermissions' in updates || needsPermissionUpdate) {
      const added = updates.customAddedPermissions || staff.customAddedPermissions || [];
      const removed = updates.customRemovedPermissions || staff.customRemovedPermissions || [];
      
      const effective = new Set([...basePermissions, ...added]);
      removed.forEach(p => effective.delete(p));
      
      updates.effectivePermissions = Array.from(effective);
      updates.permissions = Array.from(effective); // Legacy support
    }

    Object.assign(staff, updates);
    await staff.save();

    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const staff = await Staff.findOneAndDelete({ _id: req.params.id, shopId: shopId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, message: 'Staff removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
