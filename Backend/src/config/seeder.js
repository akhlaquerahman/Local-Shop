const Category = require('../models/Category');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

async function seedDatabase() {
  try {
    const User = require('../models/User');
    const bcrypt = require('bcrypt');
    
    // Seed Super Admin
    const adminEmail = 'admin@localshop.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        phone: '9999999999',
        password: hashedAdminPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isVerified: true
      });
      console.log('Seeded Super Admin: admin@localshop.com / admin123');
    } else {
      // Force reset password to admin123 for testing
      adminUser.password = await bcrypt.hash('admin123', 10);
      await adminUser.save();
    }

    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) {
      // console.log('Database already has category data. Skipping category seeding.');
      return;
    }

    console.log('Database empty! Starting data seeding...');

    // 1. Seed Categories
    const categoriesData = [
      { name: 'Groceries', slug: 'groceries', description: 'Fresh organic greens, daily dairies, pantry stables, and home essentials.', icon: 'ShoppingBag', color: 'text-emerald-500', bg: 'bg-emerald-500/10', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60' },
      { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', description: 'Farm fresh vitamins, seasonal greens, and ripe organic fruits.', icon: 'Apple', color: 'text-red-500', bg: 'bg-red-500/10', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=60' },
      { name: 'Bakery', slug: 'bakery', description: 'Crisp sourdough loaves, rich croissants, and sweet pastry treats.', icon: 'Cake', color: 'text-amber-500', bg: 'bg-amber-500/10', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60' },
      { name: 'Meat & Seafood', slug: 'meat-seafood', description: 'Premium cut poultry, fresh catch seafood, and high quality meats.', icon: 'Beef', color: 'text-rose-500', bg: 'bg-rose-500/10', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=500&auto=format&fit=crop&q=60' },
      { name: 'Pharmacy', slug: 'pharmacy', description: 'Over-the-counter medicines, health monitors, vitamins, and wellness tools.', icon: 'Pill', color: 'text-blue-500', bg: 'bg-blue-500/10', image: 'https://images.unsplash.com/photo-1584308666744-24d5e4a29ab4?w=500&auto=format&fit=crop&q=60' },
      { name: 'Baby Care', slug: 'baby-care', description: 'Diapers, gentle baby wash, organic baby food, and accessories.', icon: 'Baby', color: 'text-purple-500', bg: 'bg-purple-500/10', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=60' },
      { name: 'Electronics', slug: 'electronics', description: 'Charging cables, adapters, earphones, and aux utility accessories.', icon: 'Laptop', color: 'text-slate-500', bg: 'bg-slate-500/10', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=60' },
    ];
    await Category.insertMany(categoriesData);
    console.log('Seeded categories successfully!');

    // 2. Seed Shops
    const shopsData = [
      { name: 'Fresh Grocer - Sector 62', slug: 'fresh-grocer-sector-62', description: 'Fresh organic greens, daily dairies, and staple grains delivered in 15 minutes.', logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=60', status: 'active', category: 'Groceries', rating: 4.8, isFeatured: true, eta: '15 Mins', distance: 0.8, deliveryFee: 30, operatingHours: { open: '07:00', close: '23:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] } },
      { name: 'Gourmet Bakeries - Noida', slug: 'gourmet-bakeries-noida', description: 'Fresh sourdough loaves, rich chocolate croissants, and customized birthday cakes.', logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop&q=60', status: 'active', category: 'Bakery', rating: 4.6, isFeatured: true, eta: '20 Mins', distance: 1.5, deliveryFee: 40, operatingHours: { open: '08:00', close: '22:00', daysOpen: [1, 2, 3, 4, 5, 6] } },
      { name: 'Electro Hub Hyperlocal', slug: 'electro-hub-hyperlocal', description: 'Instant charging cables, phone adapters, powerbanks, and aux accessories.', logoUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&auto=format&fit=crop&q=60', status: 'active', category: 'Electronics', rating: 4.2, isFeatured: false, eta: '25 Mins', distance: 2.1, deliveryFee: 50, operatingHours: { open: '10:00', close: '21:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] } },
      { name: 'Daily Dairy Parlour', slug: 'daily-dairy-parlour', description: 'Fresh paneer, curd, ghee, and specialty cheese delivered every morning.', logoUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=60', status: 'active', category: 'Groceries', rating: 4.7, isFeatured: true, eta: '12 Mins', distance: 0.5, deliveryFee: 20, operatingHours: { open: '06:00', close: '20:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] } },
      { name: 'Green Pharmacy Express', slug: 'green-pharmacy-express', description: 'Prescription medicines, OTC drugs, vitamins, and health monitors.', logoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5e4a29ab4?w=200&auto=format&fit=crop&q=60', status: 'active', category: 'Pharmacy', rating: 4.9, isFeatured: false, eta: '18 Mins', distance: 1.1, deliveryFee: 35, operatingHours: { open: '08:00', close: '22:00', daysOpen: [0, 1, 2, 3, 4, 5, 6] } },
    ];
    const createdShops = await Shop.insertMany(shopsData);
    console.log('Seeded shops successfully!');

    // Resolve shop IDs for products
    const freshGrocer = createdShops.find(s => s.slug === 'fresh-grocer-sector-62');
    const gourmetBakeries = createdShops.find(s => s.slug === 'gourmet-bakeries-noida');

    // 3. Seed Products
    const productsData = [
      {
        name: 'Organic Tomato (500g)',
        slug: 'organic-tomato-500g',
        description: 'Local farm tomatoes harvested daily. Rich in vitamins, chemical-free.',
        price: 35,
        compareAtPrice: 45,
        discount: 10,
        imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=60',
        category: 'Groceries',
        shopId: freshGrocer._id,
        shopName: freshGrocer.name,
        isFeatured: true,
        isRecommended: false,
        isDeal: true
      },
      {
        name: 'Fresh Buffalo Milk (1L)',
        slug: 'fresh-buffalo-milk-1l',
        description: 'Full cream farm fresh raw milk pasteurized to retain enzymes.',
        price: 72,
        compareAtPrice: 75,
        discount: 3,
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=60',
        category: 'Groceries',
        shopId: freshGrocer._id,
        shopName: freshGrocer.name,
        isFeatured: true,
        isRecommended: true,
        isDeal: true
      },
      {
        name: 'Premium Basmati Rice (1kg)',
        slug: 'premium-basmati-rice-1kg',
        description: 'Long grain aromatic rice suitable for biryanis and everyday luxury.',
        price: 180,
        compareAtPrice: 220,
        discount: 40,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=60',
        category: 'Groceries',
        shopId: freshGrocer._id,
        shopName: freshGrocer.name,
        isFeatured: false,
        isRecommended: true,
        isDeal: false
      },
      {
        name: 'Chocolate Sourdough Croissant',
        slug: 'chocolate-sourdough-croissant',
        description: 'Crisp layered pastry filled with premium dark Belgian chocolate.',
        price: 120,
        compareAtPrice: 140,
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=60',
        category: 'Bakery',
        shopId: gourmetBakeries._id,
        shopName: gourmetBakeries.name,
        isFeatured: true,
        isRecommended: true,
        isDeal: true
      }
    ];
    await Product.insertMany(productsData);
    console.log('Seeded products successfully!');

    // 4. Seed Active Order
    const ordersData = [
      {
        orderId: 'ORD-2026-4591',
        customerId: 'user-cust-1',
        customerName: 'Akhlesh Kumar',
        shopId: freshGrocer._id.toString(),
        shopName: freshGrocer.name,
        total: 232.4,
        status: 'preparing',
        estimatedTimeMinutes: 12,
        eta: '12 Mins',
        items: [
          {
            productId: 'prod-3',
            name: 'Premium Basmati Rice (1kg)',
            price: 180,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=60'
          }
        ]
      }
    ];
    await Order.insertMany(ordersData);
    console.log('Seeded active order successfully!');

    // 5. Seed Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      const couponsData = [
        { code: 'NEIGHBOR10', discount: 10, type: 'percent', description: '10% off on all orders', minOrderValue: 0 },
        { code: 'FREESHIP', discount: 0, type: 'flat', description: 'Free delivery on this order', minOrderValue: 0 },
        { code: 'SAVE50', discount: 50, type: 'flat', description: '₹50 off on orders above ₹300', minOrderValue: 300 }
      ];
      await Coupon.insertMany(couponsData);
      console.log('Seeded coupons successfully!');
    }

    console.log('Database Seeding Complete! Enjoy testing with real data.');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

module.exports = { seedDatabase };
