const mongoose = require('mongoose');
const Staff = require('./src/models/Staff');
require('dotenv').config();

const ENFORCED_MATRICES = {
  STORE_MANAGER: ['products.view', 'products.create', 'products.edit', 'products.delete', 'inventory.view', 'inventory.manage', 'orders.view', 'orders.update', 'orders.cancel', 'deliveries.view', 'deliveries.update', 'deliveries.proof', 'users.view', 'analytics.view'],
  INVENTORY_MANAGER: ['products.view', 'products.create', 'products.edit', 'products.delete', 'inventory.view', 'inventory.manage'],
  ORDER_MANAGER: ['orders.view', 'orders.create', 'orders.update', 'orders.cancel', 'deliveries.view', 'deliveries.update', 'deliveries.proof', 'users.view'],
  SUPPORT_AGENT: ['orders.view', 'reviews.view', 'reviews.reply', 'support.view', 'support.reply']
};

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/localshop_db';
mongoose.connect(uri).then(async () => {
  console.log("=========================================");
  console.log("PHASE 2 - DATABASE CLEANUP: FIND WILDCARDS");
  console.log("=========================================");

  const badStaff = await Staff.find({ permissions: '*' });
  
  if (badStaff.length === 0) {
    console.log("No staff accounts with wildcard permissions found.");
  }

  for (const staff of badStaff) {
    console.log(`[FOUND] ID: ${staff._id} | Name: ${staff.fullName} | Role: ${staff.role} | Permissions: ${JSON.stringify(staff.permissions)}`);
    
    // Replace with correct matrix
    const newPerms = ENFORCED_MATRICES[staff.role] || [];
    staff.permissions = newPerms;
    await staff.save();
    
    console.log(`[FIXED] Updated to explicit matrix: ${newPerms.length} permissions assigned.`);
  }

  console.log("Migration complete.");
  process.exit(0);
});
