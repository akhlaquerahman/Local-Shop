const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/local-shop');
  const db = mongoose.connection.db;
  const res = await db.collection('reviews').updateMany(
    { targetModel: 'DeliveryPartner' },
    { $set: { targetModel: 'User' } }
  );
  console.log('Fixed:', res.modifiedCount);
  process.exit(0);
}

fix();
