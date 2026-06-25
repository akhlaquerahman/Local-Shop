const mongoose = require('mongoose');
require('dotenv').config();
const StaffRole = require('./src/models/StaffRole');
const User = require('./src/models/User');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/localshop_db';

mongoose.connect(uri).then(async () => {
  console.log('Connected');
  const roles = await StaffRole.find({});
  console.log('Roles:', roles.length);
  roles.forEach(r => console.log(r.name, r.shopId, r.isSystem));
  process.exit(0);
});
