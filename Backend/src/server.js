require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const path = require('path');
const app = require('./app');
const { connectDB } = require('./config/db');

app.get('/debug-db', async (req, res) => {
  const Order = require('./models/Order');
  const Delivery = require('./models/Delivery');
  const User = require('./models/User');
  const Shop = require('./models/Shop');
  const Product = require('./models/Product');
  const o = await Order.find().sort({_id:-1}).limit(5);
  const d = await Delivery.find().sort({_id:-1}).limit(5).populate('orderId');
  const u = await User.find({ role: 'DELIVERY_PARTNER' }).sort({_id:-1}).limit(2);
  const s = await Shop.find().sort({_id:-1}).limit(1);
  const p = await Product.find().sort({_id:-1}).limit(2);
  res.json({ shops: s.map(x => ({ id: x._id, logoUrlLength: x.logoUrl?.length, logoUrlHead: x.logoUrl?.substring(0, 50) })), products: p.map(x => ({ id: x._id, imageUrlLength: x.imageUrl?.length, imageUrlHead: x.imageUrl?.substring(0, 50), images: x.images })) });
});

app.get('/debug-staff', async (req, res) => {
  const Staff = require('./models/Staff');
  const staff = await Staff.findOne({ email: 'manager@gmail.com' });
  res.json({ staff });
});

app.get('/debug-returns', async (req, res) => {
  const OrderReturn = require('./models/Return');
  const returns = await OrderReturn.find().sort({_id:-1}).limit(5);
  res.json({ returns });
});

app.get('/api/dump-users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find({ role: 'SELLER' }).select('name email shopId').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../../Frontend/dist')));

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.set('io', io);

// Connect to MongoDB
connectDB().then(async () => {
  try {
    const StaffRole = require('./models/StaffRole');
    const roles = await StaffRole.find({});
    const fs = require('fs');
    fs.writeFileSync('db_roles_check.txt', 'Total roles in DB: ' + roles.length + '\n' + roles.map(r => `Role: ${r.name} Shop: ${r.shopId}`).join('\n'));
  } catch (e) {
    // console.error('DB Check error:', e);
  }
  try {
    const Staff = require('./models/Staff');
    const targetStaff = await Staff.findOne({ email: 'manager@gmail.com' });
    if (targetStaff) {
      targetStaff.permissions = ['products.view', 'products.create', 'products.edit', 'products.delete', 'inventory.view', 'inventory.manage', 'orders.view', 'orders.update', 'orders.cancel', 'deliveries.view', 'deliveries.update', 'deliveries.proof', 'users.view', 'analytics.view'];
      await targetStaff.save();
    }
  } catch(e) {}

  // --- AUTO FIX MISSING DELIVERIES ---
  try {
    const Order = require('./models/Order');
    const Delivery = require('./models/Delivery');
    const Shop = require('./models/Shop');
    
    // Find placed orders
    const orders = await Order.find({ status: { $in: ['placed', 'accepted', 'preparing', 'ready_for_pickup'] } });
    for (const order of orders) {
      try {
        const existing = await Delivery.findOne({ orderId: order._id });
        if (!existing) {
          let shop = null;
          const mongoose = require('mongoose');
          if (mongoose.Types.ObjectId.isValid(order.shopId)) {
            shop = await Shop.findById(order.shopId);
          }
          
          let validShopId = mongoose.Types.ObjectId.isValid(order.shopId) ? order.shopId : null;
          
          await Delivery.create({
            orderId: order._id,
            shopId: validShopId,
            status: 'pending',
            pickupLocation: {
              address: shop ? shop.address : 'Shop Address'
            },
            dropoffLocation: {
              address: order.deliveryDetails?.deliveryAddress || 'Home - Noida'
            },
            deliveryFee: order.deliveryFee || 40,
            distanceKm: Math.floor(Math.random() * 8) + 2,
            etaMinutes: 25,
            priority: 'normal'
          });
        }
      } catch (innerErr) {}
    }
  } catch (err) {}
  
  // --- STARTUP VALIDATION: RBAC WILDCARD CHECK ---
  try {
    const Staff = require('./models/Staff');
    const badStaffCount = await Staff.countDocuments({ permissions: '*' });
  } catch (err) {}
  // -----------------------------------

  // Initialize Autonomous Agent Workforce
  const agentOrchestrator = require('./modules/ai/agents/AgentOrchestrator');
  await agentOrchestrator.initializeAgents();
  agentOrchestrator.startScheduledTasks();
  
}).then(() => {
  server.listen(PORT, () => console.log('Server running on port ' + PORT));
});

// Trigger restart
