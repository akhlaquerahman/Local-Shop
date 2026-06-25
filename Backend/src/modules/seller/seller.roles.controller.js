const StaffRole = require('../../models/StaffRole');
const Staff = require('../../models/Staff');
const User = require('../../models/User');
const mongoose = require('mongoose');

const getSellerShopId = async (reqUser) => {
  if (reqUser.accountType === 'SELLER_STAFF' || reqUser.isStaff) return reqUser.shopId;
  const user = await User.findById(reqUser.id || reqUser._id);
  if (!user || !user.shopId) throw new Error('Seller shop not found');
  return user.shopId;
};

// Internal function to ensure system roles exist for a shop
const ensureSystemRoles = async (shopId) => {
  const systemRoles = [
    { name: 'Store Manager', description: 'Full access to all operations', permissions: ['products.view', 'products.create', 'products.edit', 'products.delete', 'inventory.view', 'inventory.manage', 'orders.view', 'orders.update', 'orders.cancel', 'deliveries.view', 'deliveries.update', 'deliveries.proof', 'users.view', 'analytics.view'] },
    { name: 'Inventory Manager', description: 'Manage products and stock', permissions: ['products.view', 'products.create', 'products.edit', 'products.delete', 'inventory.view', 'inventory.manage'] },
    { name: 'Order Manager', description: 'Process and manage orders', permissions: ['orders.view', 'orders.create', 'orders.update', 'orders.cancel', 'deliveries.view', 'deliveries.update', 'deliveries.proof', 'users.view'] },
    { name: 'Support Agent', description: 'Handle customers and reviews', permissions: ['orders.view', 'reviews.view', 'reviews.reply', 'support.view', 'support.reply'] },
    { name: 'Delivery Coordinator', description: 'Manage riders and dispatch', permissions: ['orders.view', 'deliveries.view', 'deliveries.update', 'deliveries.proof'] }
  ];

  const existingRoles = await StaffRole.find({ shopId, isSystem: true });
  if (existingRoles.length < systemRoles.length) {
    const existingNames = existingRoles.map(r => r.name);
    const rolesToCreate = systemRoles.filter(r => !existingNames.includes(r.name));
    for (const r of rolesToCreate) {
      await StaffRole.create({
        shopId,
        name: r.name,
        description: r.description,
        isSystem: true,
        permissions: r.permissions
      });
    }
  }
};

exports.getRoles = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    await ensureSystemRoles(shopId);

    const roles = await StaffRole.find({ shopId }).sort({ isSystem: -1, createdAt: -1 });
    
    // Get staff count per role
    const staffCounts = await Staff.aggregate([
      { $match: { shopId: new mongoose.Types.ObjectId(shopId.toString()) } },
      { $group: { _id: '$roleId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    staffCounts.forEach(sc => {
      if (sc._id) countMap[sc._id.toString()] = sc.count;
    });

    const rolesWithCounts = roles.map(r => ({
      ...r.toObject(),
      staffCount: countMap[r._id.toString()] || 0
    }));

    require('fs').appendFileSync('getRoles.log', `[${new Date().toISOString()}] shopId: ${shopId}, rolesCount: ${roles.length}, result: ${JSON.stringify(rolesWithCounts)}\n`);

    res.json({ success: true, data: rolesWithCounts });
  } catch (err) {
    require('fs').appendFileSync('getRoles.log', `[${new Date().toISOString()}] ERROR: ${err.message}\n`);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { name, description, permissions } = req.body;

    const existingRole = await StaffRole.findOne({ shopId, name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingRole) return res.status(400).json({ success: false, message: 'Role name already exists' });

    const role = await StaffRole.create({
      shopId,
      name,
      description,
      isSystem: false,
      permissions: permissions || [],
      createdBy: req.user.id || req.user._id
    });

    res.status(201).json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await StaffRole.findOne({ _id: id, shopId });
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    if (role.isSystem) {
      // System roles can only have permissions updated
      role.permissions = permissions || role.permissions;
    } else {
      if (name) role.name = name;
      if (description !== undefined) role.description = description;
      if (permissions) role.permissions = permissions;
    }

    role.updatedBy = req.user.id || req.user._id;
    await role.save();

    // Re-calculate effective permissions for staff with this role (including legacy staff)
    const legacyRoleString = role.name.toUpperCase().replace(/ /g, '_');
    const staffMembers = await Staff.find({
      shopId: role.shopId,
      $or: [
        { roleId: role._id },
        { role: legacyRoleString, roleId: { $exists: false } },
        { role: legacyRoleString, roleId: null }
      ]
    });

    for (const s of staffMembers) {
      // Auto-migrate legacy staff to use roleId
      if (!s.roleId) {
        s.roleId = role._id;
      }
      
      const added = s.customAddedPermissions || [];
      const removed = s.customRemovedPermissions || [];
      const effective = new Set([...role.permissions, ...added]);
      removed.forEach(p => effective.delete(p));
      s.effectivePermissions = Array.from(effective);
      await s.save();
    }

    res.json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { id } = req.params;

    const role = await StaffRole.findOne({ _id: id, shopId });
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (role.isSystem) return res.status(400).json({ success: false, message: 'Cannot delete system roles' });

    const staffCount = await Staff.countDocuments({ roleId: id });
    if (staffCount > 0) return res.status(400).json({ success: false, message: 'Cannot delete role with assigned staff' });

    await StaffRole.deleteOne({ _id: id });

    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
