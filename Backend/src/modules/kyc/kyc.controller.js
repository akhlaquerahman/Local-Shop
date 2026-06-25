const KycDocument = require('../../models/KycDocument');
const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');
const { uploadService } = require('../../services/upload.service');

const createAuditLog = async (userId, userType, shopId, action, details) => {
  await AuditLog.create({ 
    userId, 
    shopId: shopId || null, 
    action, 
    entityType: 'KycDocument', 
    details 
  });
};

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

exports.uploadDocument = async (req, res) => {
  try {
    const { documentType, documentNumber, expiryDate } = req.body;
    let { frontImageUrl, backImageUrl, pdfUrl } = req.body;
    const userId = req.user.id || req.user._id;
    const userType = req.user.role === 'RIDER' ? 'RIDER' : 'SELLER';
    const shopId = userType === 'SELLER' ? req.user.shopId : null;

    if (!documentType) {
      return res.status(400).json({ success: false, message: 'Document type is required' });
    }

    // Upload files to ImageKit if provided
    const uploadedUrls = await handleFileUploads(req.files, `/kyc/${userId}`);
    frontImageUrl = uploadedUrls.frontImageUrl || frontImageUrl;
    backImageUrl = uploadedUrls.backImageUrl || backImageUrl;
    pdfUrl = uploadedUrls.pdfUrl || pdfUrl;

    // Check if document already exists
    let doc = await KycDocument.findOne({ userId, documentType });

    if (doc) {
      // Update existing document
      doc.documentNumber = documentNumber || doc.documentNumber;
      doc.frontImageUrl = frontImageUrl || doc.frontImageUrl;
      doc.backImageUrl = backImageUrl || doc.backImageUrl;
      doc.pdfUrl = pdfUrl || doc.pdfUrl;
      if (expiryDate) doc.expiryDate = expiryDate;
      doc.status = 'PENDING';
      doc.rejectionReason = null;
      await doc.save();
    } else {
      // Create new document
      doc = new KycDocument({
        userId,
        userType,
        shopId,
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

    await createAuditLog(userId, userType, shopId, 'UPLOAD_KYC', { documentType, documentId: doc._id });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const documents = await KycDocument.find({ userId }).sort({ updatedAt: -1 });
    res.json({ success: true, data: documents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reuploadDocument = async (req, res) => {
  try {
    const docId = req.params.id;
    const userId = req.user.id || req.user._id;
    const { documentNumber, expiryDate } = req.body;
    let { frontImageUrl, backImageUrl, pdfUrl } = req.body;

    const doc = await KycDocument.findOne({ _id: docId, userId });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Upload files to ImageKit if provided
    const uploadedUrls = await handleFileUploads(req.files, `/kyc/${userId}`);
    frontImageUrl = uploadedUrls.frontImageUrl || frontImageUrl;
    backImageUrl = uploadedUrls.backImageUrl || backImageUrl;
    pdfUrl = uploadedUrls.pdfUrl || pdfUrl;

    doc.documentNumber = documentNumber || doc.documentNumber;
    doc.frontImageUrl = frontImageUrl || doc.frontImageUrl;
    doc.backImageUrl = backImageUrl || doc.backImageUrl;
    doc.pdfUrl = pdfUrl || doc.pdfUrl;
    if (expiryDate) doc.expiryDate = expiryDate;
    
    doc.status = 'PENDING';
    doc.rejectionReason = null;
    await doc.save();

    await createAuditLog(userId, doc.userType, doc.shopId, 'REUPLOAD_KYC', { documentType: doc.documentType, documentId: doc._id });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
