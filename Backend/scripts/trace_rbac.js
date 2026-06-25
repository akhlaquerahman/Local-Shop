const mongoose = require('mongoose');
const Staff = require('../src/models/Staff');
const StaffRole = require('../src/models/StaffRole');
require('dotenv').config();

async function trace() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/localshop_db');
  console.log("=== DB CONNECTED ===");

  const staff = await Staff.find({});
  for (const s of staff) {
    console.log(`\n--- STAFF: ${s.fullName} (${s.email}) ---`);
    console.log(`Role Enum: ${s.role}`);
    console.log(`RoleId: ${s.roleId}`);
    console.log(`Legacy Permissions: ${JSON.stringify(s.permissions)}`);
    console.log(`Effective Permissions: ${JSON.stringify(s.effectivePermissions)}`);
    
    if (s.roleId) {
      const role = await StaffRole.findById(s.roleId);
      if (role) {
        console.log(`-> Linked Role: ${role.name}`);
        console.log(`-> Role Permissions: ${JSON.stringify(role.permissions)}`);
      } else {
        console.log(`-> Linked Role: NOT FOUND IN DB`);
      }
    }
  }

  process.exit(0);
}

trace().catch(console.error);
