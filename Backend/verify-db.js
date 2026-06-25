const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/localshop') // Assume default connection string or require from env
  .then(async () => {
    const users = await User.find({ role: 'SELLER' }).select('name email shopId').lean();
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
