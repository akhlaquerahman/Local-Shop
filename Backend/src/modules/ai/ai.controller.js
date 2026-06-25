const aiService = require('./services/ai.service');
const ragService = require('./services/rag.service');
const AIUsageLog = require('./models/AIUsageLog');
const AIKnowledgeDocument = require('./models/AIKnowledgeDocument');
const AIChatSession = require('./models/AIChatSession');

exports.chat = async (req, res) => {
  try {
    const { message, sessionId, pageContext } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role; // Expected: CUSTOMER, SELLER, RIDER, SUPER_ADMIN

    if (!message || !sessionId) {
      return res.status(400).json({ success: false, message: 'Message and sessionId are required' });
    }

    const reply = await aiService.handleChat(userId, userRole, sessionId, message, pageContext);

    res.status(200).json({
      success: true,
      data: {
        reply
      }
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI response' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const sessions = await AIChatSession.find({ userId: req.user.id })
      .select('sessionId title updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error('getHistory Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const session = await AIChatSession.findOne({ sessionId: req.params.sessionId, userId: req.user.id }).lean();
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error('getConversation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
};

exports.renameConversation = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    
    const session = await AIChatSession.findOneAndUpdate(
      { sessionId: req.params.sessionId, userId: req.user.id },
      { title },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error('renameConversation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to rename conversation' });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const session = await AIChatSession.findOneAndDelete({ sessionId: req.params.sessionId, userId: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (error) {
    console.error('deleteConversation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
};

exports.uploadKnowledge = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, collection } = req.body;
    const doc = await ragService.processDocument(req.file, { title, collection }, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Document uploaded and indexing started',
      data: doc
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process document' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalRequests = await AIUsageLog.countDocuments();
    const successfulRequests = await AIUsageLog.countDocuments({ isSuccessful: true });
    
    // Aggregate by role
    const roleStats = await AIUsageLog.aggregate([
      { $group: { _id: '$userRole', count: { $sum: 1 }, tokens: { $sum: '$totalTokens' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        successfulRequests,
        failedRequests: totalRequests - successfulRequests,
        roleStats
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const docs = await AIKnowledgeDocument.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};
