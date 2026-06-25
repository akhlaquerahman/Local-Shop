const mongoose = require('mongoose');
const User = require('../../models/User');
const Shop = require('../../models/Shop');
const KycDocument = require('../../models/KycDocument');
const Notification = require('../../models/Notification');
const SupportTicket = require('../../models/SupportTicket');
const Report = require('../../models/Report');
const SecuritySession = require('../../models/SecuritySession');
const AuditLog = require('../../models/AuditLog');
const Order = require('../../models/Order');
const Product = require('../../models/Product');

const getSellerShopId = async (reqUser) => {
  if (reqUser.isStaff || reqUser.accountType === 'SELLER_STAFF') {
    return reqUser.shopId;
  }
  const user = await User.findById(reqUser.id || reqUser._id);
  if (!user || !user.shopId) throw new Error('Seller shop not found');
  return user.shopId;
};

const createAuditLog = async (shopId, userId, action, entityType, entityId, details) => {
  await AuditLog.create({ shopId, userId, action, entityType, entityId, details });
};

// ========================
// KYC
// ========================
exports.getKycDocuments = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const docs = await KycDocument.find({ shopId }).sort({ createdAt: -1 });

    const stats = await KycDocument.aggregate([
      { $match: { shopId: new mongoose.Types.ObjectId(shopId.toString()) } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        verified: { $sum: { $cond: [{ $eq: ['$status', 'VERIFIED'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } }
      }}
    ]);

    res.json({ success: true, data: { documents: docs, stats: stats[0] || { total: 0, verified: 0, pending: 0, rejected: 0 } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const { uploadService } = require('../../services/upload.service');

const handleFileUploads = async (files, folder) => {
  const result = { frontImageUrl: null, backImageUrl: null, pdfUrl: null };
  if (files) {
    if (files.frontImage && files.frontImage[0]) {
      const up = await uploadService.uploadFile(files.frontImage[0].buffer, files.frontImage[0].originalname, folder);
      result.frontImageUrl = up.url;
    }
    if (files.backImage && files.backImage[0]) {
      const up = await uploadService.uploadFile(files.backImage[0].buffer, files.backImage[0].originalname, folder);
      result.backImageUrl = up.url;
    }
    if (files.pdf && files.pdf[0]) {
      const up = await uploadService.uploadFile(files.pdf[0].buffer, files.pdf[0].originalname, folder);
      result.pdfUrl = up.url;
    }
  }
  return result;
};

exports.uploadKycDocument = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const userId = req.user.id || req.user._id;
    const { documentType, documentNumber, expiryDate } = req.body;
    let { fileUrl, frontImageUrl, backImageUrl, pdfUrl } = req.body;

    const uploadedUrls = await handleFileUploads(req.files, `/kyc/${userId}`);
    frontImageUrl = uploadedUrls.frontImageUrl || frontImageUrl;
    backImageUrl = uploadedUrls.backImageUrl || backImageUrl;
    pdfUrl = uploadedUrls.pdfUrl || pdfUrl;

    const doc = new KycDocument({
      shopId,
      userId,
      userType: 'SELLER',
      documentType: documentType || 'ID',
      documentNumber,
      frontImageUrl,
      backImageUrl,
      pdfUrl,
      fileUrl: pdfUrl || frontImageUrl || fileUrl || 'https://example.com/dummy-doc.pdf',
      expiryDate,
      status: 'PENDING'
    });
    await doc.save();
    await createAuditLog(shopId, userId, 'UPLOAD_KYC', 'KycDocument', doc._id, { documentType: doc.documentType });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========================
// NOTIFICATIONS
// ========================
exports.getNotifications = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const notifications = await Notification.find({ shopId }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    let filter = { shopId };
    
    if (req.params.id !== 'all') {
      filter._id = req.params.id;
    }

    await Notification.updateMany(filter, { $set: { isRead: true } });
    res.json({ success: true, message: 'Notifications updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========================
// SUPPORT
// ========================
exports.getTickets = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const tickets = await SupportTicket.find({ shopId }).sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const tNum = 'TKT-' + Date.now();
    const ticket = new SupportTicket({
      ticketNumber: tNum,
      ticketId: tNum,
      shopId,
      userId: req.user.id || req.user._id,
      userRole: 'seller',
      subject: req.body.subject,
      category: req.body.category,
      priority: req.body.priority || 'Medium',
      messages: [{ sender: 'seller', message: req.body.message }]
    });
    await ticket.save();
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========================
// REPORTS
// ========================
exports.getReports = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const reports = await Report.find({ shopId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { reportName, category, format } = req.body;
    
    let csvString = '';
    
    if (category === 'Sales') {
      const orders = await Order.find({ shopId }).sort({ createdAt: -1 }).populate('customer', 'name email');
      csvString = 'Order ID,Date,Customer Name,Customer Email,Status,Payment Method,Total Amount\\n';
      orders.forEach(o => {
        csvString += `"${o.orderId}","${new Date(o.createdAt).toLocaleString()}","${o.customer?.name || 'N/A'}","${o.customer?.email || 'N/A'}","${o.status}","${o.paymentMethod}","${o.totalAmount}"\\n`;
      });
    } else if (category === 'Inventory') {
      const products = await Product.find({ shopId }).sort({ createdAt: -1 });
      csvString = 'Product ID,Name,SKU,Category,Price,Stock,Status\\n';
      products.forEach(p => {
        csvString += `"${p._id}","${p.name.replace(/"/g, '""')}","${p.sku || 'N/A'}","${p.category || 'N/A'}","${p.price}","${p.stock}","${p.status}"\\n`;
      });
    } else {
      // Generic fallback for other categories
      csvString = 'Category,Notice\\n';
      csvString += `"${category}","This category report is currently under development."\\n`;
    }

    const base64Csv = Buffer.from(csvString).toString('base64');
    const fileUrl = `data:text/csv;base64,${base64Csv}`;

    const report = new Report({
      shopId,
      reportName: reportName,
      category: category,
      format: format,
      status: 'COMPLETED',
      fileUrl: fileUrl,
      generatedAt: new Date(),
      createdBy: req.user.id || req.user._id
    });
    
    await report.save();
    await createAuditLog(shopId, req.user.id || req.user._id, 'GENERATE_REPORT', 'Report', report._id, { reportName: report.reportName });
    
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========================
// PROFILE
// ========================
exports.getProfile = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    let user;
    if (req.user.isStaff || req.user.accountType === 'SELLER_STAFF') {
      const Staff = require('../../models/Staff');
      user = await Staff.findById(req.user.id || req.user._id);
    } else {
      user = await User.findById(req.user.id || req.user._id).select('-password');
    }

    const shop = await Shop.findById(shopId);
    res.json({ success: true, data: { user, shop } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { avatarUrl, ...shopData } = req.body;
    
    // Update Shop
    if (avatarUrl && !shopData.logoUrl) {
      shopData.logoUrl = avatarUrl;
    }
    const shop = await Shop.findByIdAndUpdate(shopId, { $set: shopData }, { new: true });
    
    // Update User Avatar if provided
    if (avatarUrl) {
      await User.findByIdAndUpdate(req.user.id || req.user._id, { avatarUrl });
    }
    
    await createAuditLog(shopId, req.user.id || req.user._id, 'UPDATE_PROFILE', 'Shop', shopId, req.body);
    res.json({ success: true, data: shop });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getShopLocation = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const shop = await Shop.findById(shopId).select('location');
    res.json({ success: true, location: shop.location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateShopLocation = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    // Validate request
    const { coordinates, address, city, state, postalCode, type } = req.body;
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'Valid coordinates [lng, lat] are required' });
    }
    
    const locationData = {
      type: type || 'Point',
      coordinates,
      address,
      city,
      state,
      postalCode,
      updatedAt: new Date()
    };

    const shop = await Shop.findByIdAndUpdate(
      shopId, 
      { $set: { location: locationData } }, 
      { new: true }
    );
    
    await createAuditLog(shopId, req.user.id || req.user._id, 'UPDATE_LOCATION', 'Shop', shopId, { location: locationData });
    res.json({ success: true, location: shop.location });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========================
// SECURITY
// ========================
exports.getSecurityData = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const sessions = await SecuritySession.find({ shopId }).sort({ lastActive: -1 });
    res.json({ success: true, data: { sessions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logoutAllSessions = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    await SecuritySession.updateMany({ shopId, _id: { $ne: req.sessionID } }, { $set: { isActive: false } }); // Just illustrative logic
    res.json({ success: true, message: 'Other sessions terminated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========================
// AUDIT LOGS
// ========================
exports.getAuditLogs = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const logs = await AuditLog.find({ shopId }).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
