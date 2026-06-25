const mongoose = require('mongoose');
const { seedDatabase } = require('./seeder');

exports.connectDB = async () => {
  try { 
    await mongoose.connect(process.env.MONGO_URI); 
    console.log('MongoDB connected'); 
    // Seed initial data if database is empty
    await seedDatabase();
  }
  catch (err) { 
    console.error('Database connection / seeding error:', err); 
    process.exit(1); 
  }
};

