import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UsersModel, UserRole, UserStatus } from '../modules/users/models/users.model';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/localshop';

async function seedSuperAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Check if ANY Super Admin exists
    const existingAdmin = await UsersModel.findOne({ role: UserRole.SUPER_ADMIN });
    
    if (existingAdmin) {
      console.log('Super Admin already exists. Skipping creation.');
      console.log('Existing Admin Email:', existingAdmin.email);
      process.exit(0);
    }

    // 2. Create the solitary initial Super Admin account
    console.log('No Super Admin found. Creating initial system admin...');
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);

    const superAdmin = await UsersModel.create({
      name: 'Akhlaque Rahman',
      email: 'admin@localshop.com',
      phone: '+910000000000',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true
    });

    console.log('✅ Initial Super Admin created successfully!');
    console.log('Email: admin@localshop.com');
    console.log('Role: FULL_SYSTEM_ACCESS');
    
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedSuperAdmin();
