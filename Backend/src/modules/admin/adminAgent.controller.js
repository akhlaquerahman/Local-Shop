const AdminAgent = require('../../models/AdminAgent');
const AdminRole = require('../../models/AdminRole');
const bcrypt = require('bcrypt');

exports.getRoles = async (req, res) => {
  try {
    const roles = await AdminRole.find();
    res.json({ success: true, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const role = new AdminRole({
      name,
      description,
      permissions,
      createdBy: req.user.id
    });
    await role.save();
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAgents = async (req, res) => {
  try {
    const agents = await AdminAgent.find().populate('roleId');
    const stats = {
      total: await AdminAgent.countDocuments(),
      active: await AdminAgent.countDocuments({ status: 'ACTIVE' }),
      suspended: await AdminAgent.countDocuments({ status: 'SUSPENDED' })
    };
    res.json({ success: true, staff: agents, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const { fullName, email, phone, password, age, gender, dateOfJoining, roleId, status } = req.body;
    
    // Generate Employee Code
    const count = await AdminAgent.countDocuments();
    const employeeCode = `AGENT-${(count + 1).toString().padStart(4, '0')}`;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let effectivePermissions = [];
    if (roleId) {
      const role = await AdminRole.findById(roleId);
      if (role) {
        effectivePermissions = role.permissions;
      }
    }

    const agent = new AdminAgent({
      employeeCode,
      fullName,
      email,
      phone,
      password: hashedPassword,
      age,
      gender,
      dateOfJoining,
      roleId,
      status: status || 'ACTIVE',
      effectivePermissions,
      createdBy: req.user.id
    });

    await agent.save();
    res.status(201).json({ success: true, data: agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    if (updateData.roleId) {
       const role = await AdminRole.findById(updateData.roleId);
       if (role) {
         updateData.effectivePermissions = role.permissions;
       }
    }

    const agent = await AdminAgent.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    res.json({ success: true, data: agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const agent = await AdminAgent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }
    res.json({ success: true, message: 'Agent removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const role = await AdminRole.findByIdAndUpdate(
      req.params.id, 
      { name, description, permissions, updatedBy: req.user.id }, 
      { new: true, runValidators: true }
    );
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await AdminRole.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (role.isSystem) return res.status(403).json({ success: false, message: 'Cannot delete a system role' });
    
    // Check if agents use this role
    const agentsCount = await AdminAgent.countDocuments({ roleId: req.params.id });
    if (agentsCount > 0) return res.status(400).json({ success: false, message: 'Cannot delete role assigned to agents' });
    
    await AdminRole.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
