const mongoose = require('mongoose');
const Delivery = require('../../models/Delivery');
const DeliveryRequest = require('../../models/DeliveryRequest');
const Order = require('../../models/Order');
const AuditLog = require('../../models/AuditLog');

const createAuditLog = async (userId, action, entityType, entityId, details) => {
  try {
    await AuditLog.create({ userId, action, entityType, entityId, details });
  } catch (err) {
    console.error('AuditLog error:', err);
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const riderId = req.user._id || req.user.id;
    const completedCount = await Delivery.countDocuments({ riderId, status: 'delivered' });
    const activeCount = await Delivery.countDocuments({ riderId, status: { $in: ['assigned', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_dropoff'] } });
    
    const earningsAggr = await Delivery.aggregate([
      { $match: { riderId: new mongoose.Types.ObjectId(riderId), status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$deliveryFee' } } }
    ]);
    const earnings = earningsAggr.length ? earningsAggr[0].total : 0;

    const totalRequests = await DeliveryRequest.countDocuments({ riderId });
    const approvedRequests = await DeliveryRequest.countDocuments({ riderId, status: 'approved' });
    const acceptanceRate = totalRequests ? Math.round((approvedRequests / totalRequests) * 100) : 100;

    res.json({
      success: true,
      data: {
        earnings,
        completedDeliveries: completedCount,
        activeDeliveries: activeCount,
        acceptanceRate,
        onlineTime: 8 // mock online time
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAvailableDeliveries = async (req, res) => {
  try {
    const User = require('../../models/User');
    const riderId = req.user._id || req.user.id;
    const requestedIds = (await DeliveryRequest.find({ riderId }).select('deliveryId')).map(r => r.deliveryId);

    const user = await User.findById(riderId);
    const activeAreas = user.serviceAreas?.filter(sa => sa.status === 'Active') || [];
    
    if (activeAreas.length === 0) {
      return res.json({ success: true, data: [] }); // No service areas = no deliveries
    }

    // Get all pending deliveries
    const allPending = await Delivery.find({
      status: 'pending',
      _id: { $nin: requestedIds }
    }).populate('orderId').populate('shopId', 'name address');

    // Filter in memory based on order delivery address
    const available = allPending.filter(delivery => {
      const order = delivery.orderId;
      if (!order) return false;

      const addressStr = (order.deliveryDetails?.deliveryAddress || '').toLowerCase().trim();
      if (!addressStr) return false;

      let isMatch = false;
      let rejectReason = "No matching active service area";

      for (const area of activeAreas) {
        const normalizedCity = (area.city || '').toLowerCase().trim();
        const normalizedState = (area.state || '').toLowerCase().trim();

        const matchCity = normalizedCity && addressStr.includes(normalizedCity);
        // Because the address string might not contain the state (e.g. 'Siwan, Siwan'), 
        // we should not strictly require the state to be present in the string.
        // We consider it a match if the city matches.
        
        if (matchCity) {
          isMatch = true;
          rejectReason = "N/A";
          break; // Found a match, no need to check other areas
        }
      }

      // Temporarily add requested debug logs
      console.log('--- DEBUG LOG ---');
      console.log('Rider ID:', riderId);
      console.log('Rider Service Areas:', activeAreas.map(a => `${a.city} ${a.state}`).join(', '));
      console.log('Order ID:', order.orderId);
      console.log('Order Delivery Address:', order.deliveryDetails?.deliveryAddress);
      console.log('Match:', isMatch);
      console.log('Returned:', isMatch ? 'YES' : 'NO');
      if (!isMatch) console.log('Reason For Rejection:', rejectReason);
      console.log('-----------------');

      return isMatch;
    });

    res.json({ success: true, data: available });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.requestDelivery = async (req, res) => {
  try {
    const riderId = req.user._id || req.user.id;
    const { id } = req.params;

    const delivery = await Delivery.findById(id);
    if (!delivery || delivery.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Delivery is no longer available' });
    }

    const request = new DeliveryRequest({
      deliveryId: id,
      riderId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });
    await request.save();

    await createAuditLog(riderId, 'REQUESTED_DELIVERY', 'DeliveryRequest', request._id, { deliveryId: id });

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const riderId = req.user._id || req.user.id;
    const requests = await DeliveryRequest.find({ riderId }).populate({
      path: 'deliveryId',
      populate: { path: 'shopId', select: 'name' }
    });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAssignedDeliveries = async (req, res) => {
  try {
    const riderId = req.user._id || req.user.id;
    const assigned = await Delivery.find({ 
      riderId, 
      status: { $in: ['assigned', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_dropoff'] } 
    })
    .populate('orderId')
    .populate('shopId', 'name address phone');

    res.json({ success: true, data: assigned });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const riderId = req.user._id || req.user.id;
    const { id } = req.params;
    const { status, verificationCode } = req.body;

    const delivery = await Delivery.findOne({ _id: id, riderId });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found or not assigned to you' });

    if (status === 'delivered') {
      if (delivery.orderId) {
        const order = await Order.findById(delivery.orderId);
        if (order) {
          if (!verificationCode || order.deliveryVerificationCode !== verificationCode) {
            return res.status(400).json({ success: false, message: 'Invalid delivery verification code' });
          }
        }
      }
    }

    delivery.status = status;
    if (status === 'delivered') {
      delivery.deliveredAt = new Date();
    }
    await delivery.save();

    if (delivery.orderId) {
      const order = await Order.findById(delivery.orderId);
      if (order) {
        if (status === 'picked_up') order.status = 'picked_up';
        if (status === 'delivered') order.status = 'delivered';
        await order.save();
      }
    }

    await createAuditLog(riderId, 'UPDATED_DELIVERY_STATUS', 'Delivery', id, { status });

    const io = req.app.get('io');
    if (io) {
      io.to(`rider_${riderId}`).emit('delivery_status_updated', { deliveryId: id, status });
    }

    res.json({ success: true, data: delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInTransitDelivery = async (req, res) => {
  try {
    const riderId = req.user._id || req.user.id;
    const delivery = await Delivery.findOne({ riderId, status: 'in_transit' })
      .populate('orderId')
      .populate('shopId', 'name address phone');
    res.json({ success: true, data: delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCompletedDeliveries = async (req, res) => {
  try {
    const riderId = req.user._id || req.user.id;
    const deliveries = await Delivery.find({ riderId, status: 'delivered' })
      .populate('orderId', 'customerName')
      .sort('-deliveredAt');
    res.json({ success: true, data: deliveries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFailedDeliveries = async (req, res) => {
  try {
    const riderId = req.user._id || req.user.id;
    const deliveries = await Delivery.find({ riderId, status: 'failed' })
      .populate('orderId', 'customerName')
      .sort('-updatedAt');
    res.json({ success: true, data: deliveries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const riderId = req.user._id || req.user.id;
    const deliveries = await Delivery.find({ riderId, status: 'delivered' });
    
    let totalEarnings = 0;
    let base = 0, distance = 0, tips = 0, penalties = 0;
    
    deliveries.forEach(d => {
      totalEarnings += (d.deliveryFee || 0);
      if (d.earningsBreakdown) {
        base += d.earningsBreakdown.base;
        distance += d.earningsBreakdown.distance;
        tips += d.earningsBreakdown.tips;
        penalties += d.earningsBreakdown.penalties;
      }
    });

    res.json({ 
      success: true, 
      data: {
        totalEarnings,
        breakdown: { base, distance, tips, penalties },
        deliveriesCount: deliveries.length
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPayouts = async (req, res) => {
  try {
    const Payout = require('../../models/Payout');
    const riderId = req.user._id || req.user.id;
    const payouts = await Payout.find({ userId: riderId, userType: 'rider' }).sort('-createdAt');
    res.json({ success: true, data: payouts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PHASE 3 CONTROLLERS

exports.getWallet = async (req, res) => {
  try {
    const Wallet = require('../../models/Wallet');
    const Transaction = require('../../models/Transaction');
    const riderId = req.user._id || req.user.id;
    let wallet = await Wallet.findOne({ userId: riderId });
    if (!wallet) wallet = await Wallet.create({ userId: riderId, balance: 0, lifetimeCashback: 0 });
    const transactions = await Transaction.find({ userId: riderId }).sort('-createdAt').limit(20);
    res.json({ success: true, data: { wallet, transactions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRatings = async (req, res) => {
  try {
    const Review = require('../../models/Review');
    const riderId = req.user._id || req.user.id;
    const reviews = await Review.find({ targetId: riderId }).sort('-createdAt');
    let avg = 0;
    if (reviews.length > 0) {
      avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    }
    res.json({ success: true, data: { reviews, average: avg.toFixed(1), total: reviews.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const KycDocument = require('../../models/KycDocument');
    const riderId = req.user._id || req.user.id;
    const documents = await KycDocument.find({ userId: riderId });
    res.json({ success: true, data: documents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const { uploadService } = require('../../services/upload.service');

const handleFileUploadsRider = async (files, folder) => {
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

exports.uploadDocument = async (req, res) => {
  try {
    const KycDocument = require('../../models/KycDocument');
    const riderId = req.user._id || req.user.id;
    const { documentType, documentNumber, expiryDate } = req.body;
    let { frontImageUrl, backImageUrl, pdfUrl } = req.body;

    if (!documentType) {
      return res.status(400).json({ success: false, message: 'Document type is required' });
    }

    const uploadedUrls = await handleFileUploadsRider(req.files, `/kyc/${riderId}`);
    frontImageUrl = uploadedUrls.frontImageUrl || frontImageUrl;
    backImageUrl = uploadedUrls.backImageUrl || backImageUrl;
    pdfUrl = uploadedUrls.pdfUrl || pdfUrl;

    let doc = await KycDocument.findOne({ userId: riderId, documentType });

    if (doc) {
      doc.documentNumber = documentNumber || doc.documentNumber;
      doc.frontImageUrl = frontImageUrl || doc.frontImageUrl;
      doc.backImageUrl = backImageUrl || doc.backImageUrl;
      doc.pdfUrl = pdfUrl || doc.pdfUrl;
      if (expiryDate) doc.expiryDate = expiryDate;
      doc.status = 'PENDING';
      doc.rejectionReason = null;
      await doc.save();
    } else {
      doc = new KycDocument({
        userId: riderId,
        userType: 'RIDER',
        documentType,
        documentNumber,
        frontImageUrl,
        backImageUrl,
        pdfUrl,
        expiryDate,
        status: 'PENDING'
      });
      await doc.save();
    }

    await createAuditLog(riderId, 'UPLOAD_KYC', 'KycDocument', doc._id, { documentType: doc.documentType });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getKycStatus = async (req, res) => {
  try {
    // mock kyc status from documents and user
    const KycDocument = require('../../models/KycDocument');
    const riderId = req.user._id || req.user.id;
    const documents = await KycDocument.find({ userId: riderId });
    const isVerified = documents.length > 0 && documents.every(d => d.status === 'verified');
    res.json({ success: true, data: { status: isVerified ? 'verified' : 'pending', documents } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const Notification = require('../../models/Notification');
    const riderId = req.user._id || req.user.id;
    const notifications = await Notification.find({ userId: riderId }).sort('-createdAt');
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.readNotifications = async (req, res) => {
  try {
    const Notification = require('../../models/Notification');
    const riderId = req.user._id || req.user.id;
    await Notification.updateMany({ userId: riderId, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSupportTickets = async (req, res) => {
  try {
    const SupportTicket = require('../../models/SupportTicket');
    const riderId = req.user._id || req.user.id;
    const tickets = await SupportTicket.find({ userId: riderId }).sort('-createdAt');
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSupportTicket = async (req, res) => {
  try {
    const SupportTicket = require('../../models/SupportTicket');
    const riderId = req.user._id || req.user.id;
    const { subject, category, message, priority } = req.body;
    const tNum = 'TKT-' + Date.now();
    const ticket = await SupportTicket.create({ 
      ticketNumber: tNum,
      ticketId: tNum,
      userId: riderId, 
      userRole: 'rider',
      subject, 
      category, 
      priority: priority || 'Medium',
      messages: [{ sender: 'rider', message }] 
    });
    res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('[createSupportTicket rider] error:', err);
    require('fs').appendFileSync('error.log', new Date().toISOString() + ' [RIDER TICKET ERROR] ' + err.stack + '\n');
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const User = require('../../models/User');
    const riderId = req.user._id || req.user.id;
    const user = await User.findById(riderId).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const User = require('../../models/User');
    const riderId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(riderId, req.body, { new: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSecurity = async (req, res) => {
  try {
    const SecuritySession = require('../../models/SecuritySession');
    const riderId = req.user._id || req.user.id;
    const sessions = await SecuritySession.find({ userId: riderId }).sort('-createdAt');
    res.json({ success: true, data: { sessions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSecurity = async (req, res) => {
  try {
    res.json({ success: true, message: 'Security updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const Setting = require('../../models/Setting');
    const riderId = req.user._id || req.user.id;
    let settings = await Setting.findOne({ userId: riderId });
    if (!settings) settings = await Setting.create({ userId: riderId, preferences: {} });
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const Setting = require('../../models/Setting');
    const riderId = req.user._id || req.user.id;
    const settings = await Setting.findOneAndUpdate({ userId: riderId }, { preferences: req.body }, { new: true, upsert: true });
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- SERVICE AREAS ENDPOINTS ---
exports.getServiceAreas = async (req, res) => {
  try {
    const User = require('../../models/User');
    const riderId = req.user._id || req.user.id;
    const user = await User.findById(riderId);
    res.json({ success: true, data: user.serviceAreas || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addServiceArea = async (req, res) => {
  try {
    const User = require('../../models/User');
    const riderId = req.user._id || req.user.id;
    const user = await User.findById(riderId);
    
    // Check for duplicates
    const isDuplicate = user.serviceAreas.some(sa => sa.city.toLowerCase() === req.body.city.toLowerCase() && sa.state.toLowerCase() === req.body.state.toLowerCase());
    if (isDuplicate) {
      return res.status(400).json({ success: false, message: 'Service area for this city already exists' });
    }

    if (req.body.isDefault) {
      user.serviceAreas.forEach(sa => sa.isDefault = false);
    } else if (user.serviceAreas.length === 0) {
      req.body.isDefault = true;
    }

    user.serviceAreas.push(req.body);
    await user.save();
    
    await createAuditLog(riderId, 'ADDED_SERVICE_AREA', 'User', riderId, { city: req.body.city });
    
    res.json({ success: true, data: user.serviceAreas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateServiceArea = async (req, res) => {
  try {
    const User = require('../../models/User');
    const riderId = req.user._id || req.user.id;
    const { id } = req.params;
    
    const user = await User.findById(riderId);
    const area = user.serviceAreas.id(id);
    
    if (!area) return res.status(404).json({ success: false, message: 'Service area not found' });

    if (req.body.isDefault && !area.isDefault) {
      user.serviceAreas.forEach(sa => sa.isDefault = false);
    }
    
    Object.assign(area, req.body);
    await user.save();
    
    await createAuditLog(riderId, 'UPDATED_SERVICE_AREA', 'User', riderId, { city: area.city });
    
    res.json({ success: true, data: user.serviceAreas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteServiceArea = async (req, res) => {
  try {
    const User = require('../../models/User');
    const riderId = req.user._id || req.user.id;
    const { id } = req.params;
    
    const user = await User.findById(riderId);
    const area = user.serviceAreas.id(id);
    
    if (!area) return res.status(404).json({ success: false, message: 'Service area not found' });
    
    const city = area.city;
    area.deleteOne();
    
    // If we deleted the default, set another one as default
    if (area.isDefault && user.serviceAreas.length > 0) {
      user.serviceAreas[0].isDefault = true;
    }
    
    await user.save();
    
    await createAuditLog(riderId, 'DELETED_SERVICE_AREA', 'User', riderId, { city });
    
    res.json({ success: true, data: user.serviceAreas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
