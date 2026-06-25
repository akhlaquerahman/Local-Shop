const mongoose = require('mongoose');
const Staff = require('../src/models/Staff');
const fs = require('fs');
require('dotenv').config();

const ENFORCED_MATRICES = {
  STORE_MANAGER: ['products.view', 'products.create', 'products.edit', 'products.delete', 'inventory.view', 'inventory.manage', 'orders.view', 'orders.update', 'orders.cancel', 'deliveries.view', 'deliveries.update', 'deliveries.proof', 'users.view', 'analytics.view'],
  INVENTORY_MANAGER: ['products.view', 'products.create', 'products.edit', 'products.delete', 'inventory.view', 'inventory.manage'],
  ORDER_MANAGER: ['orders.view', 'orders.create', 'orders.update', 'orders.cancel', 'deliveries.view', 'deliveries.update', 'deliveries.proof', 'users.view'],
  SUPPORT_AGENT: ['orders.view', 'reviews.view', 'reviews.reply', 'support.view', 'support.reply']
};

const SELLER_NAVIGATION = [
  { label: 'Dashboard Overview', permission: undefined },
  { label: 'Products', permission: 'products.view' },
  { label: 'Create Product', permission: 'products.create' },
  { label: 'Bulk Upload', permission: 'products.create' },
  { label: 'Inventory', permission: 'inventory.view' },
  { label: 'Orders', permission: 'orders.view' },
  { label: 'Delivery Requests', permission: 'orders.view' },
  { label: 'Delivery Partners', permission: 'orders.view' },
  { label: 'Customers', permission: 'users.view' },
  { label: 'Coupons', permission: 'coupons.view' },
  { label: 'Promotions', permission: 'coupons.view' },
  { label: 'Marketing Tools', permission: 'coupons.view' },
  { label: 'Payouts', permission: 'payouts.view' },
  { label: 'Reviews & Ratings', permission: 'reviews.view' },
  { label: 'Shop Settings', permission: 'shops.manage' },
  { label: 'Staff Management', permission: 'shops.manage' },
  { label: 'KYC Documents', permission: 'shops.manage' },
  { label: 'Notifications', permission: 'notifications.view' },
  { label: 'Support', permission: 'support.view' },
  { label: 'Reports', permission: 'reports.view' },
  { label: 'Profile', permission: undefined },
  { label: 'Security', permission: 'shops.manage' },
  { label: 'Activity Logs', permission: 'shops.manage' }
];

function hasPermission(user, permission) {
  if (!user) return false;
  if (user.isStaff) {
    return user.permissions?.includes(permission) || false;
  }
  return false;
}

function generateSidebar(user) {
  return SELLER_NAVIGATION.filter(item => {
    if (user.accountType === 'SELLER_OWNER') return true;
    if (user.isStaff) {
      if (item.permission) {
        if (!hasPermission(user, item.permission)) return false;
      }
    }
    return true;
  }).map(i => i.label);
}

async function runVerification() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/localshop_db';
  console.log(`Connecting to: ${uri}`);
  await mongoose.connect(uri);
  
  let output = "";
  const log = (msg) => {
    console.log(msg);
    output += msg + "\n";
  };

  log("=================================================");
  log("STEP 1: Find all staff accounts");
  log("=================================================");
  
  const allStaff = await Staff.find({});
  if (allStaff.length === 0) {
    log("NO STAFF FOUND IN DATABASE.");
    process.exit(1);
  }

  log(`Found ${allStaff.length} staff members:`);
  for (const s of allStaff) {
    log(`-----------------------------------`);
    log(`_id: ${s._id}`);
    log(`name: ${s.fullName}`);
    log(`email: ${s.email}`);
    log(`role: ${s.role}`);
    log(`permissions: ${JSON.stringify(s.permissions)}`);
  }

  // Use the first one for simulation
  let staff = allStaff[0];

  log("\n=================================================");
  log("STEP 2: Console output during login (Simulated Context)");
  log("=================================================");
  
  const userContext = {
    role: "seller_staff",
    isStaff: true,
    accountType: "SELLER_STAFF",
    permissions: staff.permissions
  };

  log(`user.role: ${userContext.role}`);
  log(`user.isStaff: ${userContext.isStaff}`);
  log(`user.accountType: ${userContext.accountType}`);
  log(`user.permissions: ${JSON.stringify(userContext.permissions)}`);

  log("\n=================================================");
  log("STEP 3: hasPermission Output");
  log("=================================================");
  
  log(`hasPermission(user, 'products.view') : ${hasPermission(userContext, 'products.view')}`);
  log(`hasPermission(user, 'inventory.view'): ${hasPermission(userContext, 'inventory.view')}`);
  log(`hasPermission(user, 'orders.view')   : ${hasPermission(userContext, 'orders.view')}`);
  log(`hasPermission(user, 'customers.view'): ${hasPermission(userContext, 'users.view')}`); // Mapped

  log("\n=================================================");
  log("STEP 4: Generated Sidebar Array (Before Migration)");
  log("=================================================");
  
  log(JSON.stringify(generateSidebar(userContext), null, 2));

  log("\n=================================================");
  log("STEP 5: Database Migration & Verification");
  log("=================================================");

  if (staff.permissions.includes('*')) {
    log(`BEFORE:\n["*"]`);
    
    // Execute migration
    const newPerms = ENFORCED_MATRICES[staff.role] || [];
    staff.permissions = newPerms;
    await staff.save();
    
    log(`\nAFTER:\n${JSON.stringify(staff.permissions, null, 2)}`);
    
    // Test sidebar again
    userContext.permissions = staff.permissions;
    log("\n[VERIFICATION] Generated Sidebar Array (After Migration):");
    log(JSON.stringify(generateSidebar(userContext), null, 2));
    
  } else {
    log("No ['*'] found. Array is already strict:");
    log(JSON.stringify(staff.permissions, null, 2));
  }

  log("\n=================================================");
  log("MIGRATION COMPLETE.");
  
  fs.writeFileSync('verification_output.txt', output);
  log("\nReport saved to verification_output.txt");
  process.exit(0);
}

runVerification().catch(console.error);
