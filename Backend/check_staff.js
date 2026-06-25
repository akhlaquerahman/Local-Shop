const mongoose = require('mongoose');
const Staff = require('./src/models/Staff');
require('dotenv').config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/localshop_db';

mongoose.connect(uri).then(async () => {
  const staff = await Staff.find({});
  console.log('--- STAFF FOUND ---');
  staff.forEach(s => {
    console.log(`ID: ${s._id}`);
    console.log(`Name: ${s.fullName}`);
    console.log(`Email: ${s.email}`);
    console.log(`Role: ${s.role}`);
    console.log(`Permissions: ${JSON.stringify(s.permissions)}`);
    console.log('-------------------');
    
    // Auto-fix if permissions are empty or '*'
    if (!s.permissions || s.permissions.length === 0 || s.permissions.includes('*')) {
      s.permissions = ['products.view', 'products.create', 'products.edit', 'products.delete', 'inventory.view', 'inventory.manage', 'orders.view', 'orders.update', 'orders.cancel', 'deliveries.view', 'deliveries.update', 'deliveries.proof', 'users.view', 'analytics.view'];
      s.save().then(() => console.log('Auto-fixed permissions for this staff member.'));
    }
  });
  
  setTimeout(() => process.exit(0), 1000);
});
