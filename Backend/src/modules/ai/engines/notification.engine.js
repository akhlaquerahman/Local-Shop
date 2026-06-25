const AINotification = require('../models/AINotification');

class NotificationEngine {
  async generateProactiveAlert(userId, role, category, title, message, actionPayload = null) {
    const notification = await AINotification.create({
      userId,
      role,
      category,
      title,
      message,
      actionPayload
    });
    
    // In production, this might emit via Socket.IO
    // io.to(userId.toString()).emit('ai_notification', notification);
    return notification;
  }

  async getUserNotifications(userId) {
    return await AINotification.find({ userId }).sort({ createdAt: -1 }).limit(20);
  }
}

module.exports = new NotificationEngine();
