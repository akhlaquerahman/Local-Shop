const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/localshop_db');
  console.log("=== DB CONNECTED ===");

  const product = await Product.findOne({});
  if (product) {
    console.log(`Product shopId: ${product.shopId} (type: ${typeof product.shopId}, constructor: ${product.shopId.constructor.name})`);
    
    const shopIdStr = product.shopId.toString();
    const statsStr = await Product.aggregate([{ $match: { shopId: shopIdStr } }, { $count: "count" }]);
    console.log(`Product match string:`, statsStr);

    const statsObj = await Product.aggregate([{ $match: { shopId: new mongoose.Types.ObjectId(shopIdStr) } }, { $count: "count" }]);
    console.log(`Product match ObjectId:`, statsObj);
  } else {
    console.log("No product found");
  }

  const order = await Order.findOne({});
  if (order) {
    console.log(`Order shopId: ${order.shopId} (type: ${typeof order.shopId}, constructor: ${order.shopId.constructor.name})`);
    
    const shopIdStr = order.shopId.toString();
    const statsStr = await Order.aggregate([{ $match: { shopId: shopIdStr } }, { $count: "count" }]);
    console.log(`Order match string:`, statsStr);

    const statsObj = await Order.aggregate([{ $match: { shopId: new mongoose.Types.ObjectId(shopIdStr) } }, { $count: "count" }]);
    console.log(`Order match ObjectId:`, statsObj);
  } else {
    console.log("No order found");
  }

  process.exit(0);
}

test().catch(console.error);
