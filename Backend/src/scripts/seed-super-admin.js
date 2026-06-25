require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/localshop');
    console.log('Connected to DB for admin seeding.');

    const adminCount = await User.countDocuments({ role: 'SUPER_ADMIN' });
    if (adminCount > 0) {
      console.log('A Super Admin already exists. Cannot create another one.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const superAdmin = new User({
      name: 'Super Admin',
      email: 'admin@localshop.com',
      phone: '+919999999999',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isVerified: true,
      gender: 'prefer_not_to_say'
    });

    await superAdmin.save();
    console.log('Super Admin account created successfully!');
    console.log('Email: admin@localshop.com');
    console.log('Password: Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating Super Admin:', error);
    process.exit(1);
  }
};

seedAdmin();
