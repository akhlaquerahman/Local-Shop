const KycDocument = require('../../models/KycDocument');
const AuditLog = require('../../models/AuditLog');

const createAuditLog = async (userId, shopId, action, details) => {
  await AuditLog.create({ 
    userId, 
    shopId: shopId || null, 
    action, 
    entityType: 'KycDocument', 
    details 
  });
};

exports.getAllKyc = async (req, res) => {
  try {
    const { status, userType } = req.query;
    let query = {};
    if (status) query.status = status;
    if (userType) query.userType = userType;

    const documents = await KycDocument.find(query)
      .populate('userId', 'name email phone')
      .populate('shopId', 'name')
      .sort({ createdAt: -1 });

    const stats = await KycDocument.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObj = {
      total: documents.length,
      pending: stats.find(s => s._id === 'PENDING')?.count || 0,
      underReview: stats.find(s => s._id === 'UNDER_REVIEW')?.count || 0,
      approved: stats.find(s => s._id === 'APPROVED')?.count || 0,
      rejected: stats.find(s => s._id === 'REJECTED')?.count || 0,
      reuploadRequired: stats.find(s => s._id === 'REUPLOAD_REQUIRED')?.count || 0,
    };

    res.json({ success: true, data: documents, stats: statsObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getKycById = async (req, res) => {
  try {
    const doc = await KycDocument.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('shopId', 'name address');
      
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveKyc = async (req, res) => {
  try {
    const doc = await KycDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    doc.status = 'APPROVED';
    doc.reviewedBy = req.user.id || req.user._id;
    doc.reviewedAt = new Date();
    await doc.save();

    await createAuditLog(req.user.id || req.user._id, doc.shopId, 'APPROVE_KYC', { documentId: doc._id, documentType: doc.documentType });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectKyc = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const doc = await KycDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    doc.status = 'REJECTED';
    doc.rejectionReason = rejectionReason;
    doc.reviewedBy = req.user.id || req.user._id;
    doc.reviewedAt = new Date();
    await doc.save();

    await createAuditLog(req.user.id || req.user._id, doc.shopId, 'REJECT_KYC', { documentId: doc._id, reason: rejectionReason });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.requestReupload = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required for re-upload request' });
    }

    const doc = await KycDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    doc.status = 'REUPLOAD_REQUIRED';
    doc.rejectionReason = reason;
    doc.reviewedBy = req.user.id || req.user._id;
    doc.reviewedAt = new Date();
    await doc.save();

    await createAuditLog(req.user.id || req.user._id, doc.shopId, 'REQUEST_KYC_REUPLOAD', { documentId: doc._id, reason });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
