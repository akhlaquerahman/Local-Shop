const BaseAgent = require('./BaseAgent');
const Order = require('../../../models/Order');

class FraudAgent extends BaseAgent {
  constructor() {
    super('FRAUD_AGENT', 'AI Fraud Agent');
  }

  async runDailyScan() {
    const startTime = Date.now();
    try {
      console.log(`[${this.name}] Starting Daily Scan...`);
      
      // Heuristic scan: Find users with more than 5 cancelled/refunded orders today
      const today = new Date();
      today.setHours(0,0,0,0);

      const suspiciousUsers = await Order.aggregate([
        { $match: { status: { $in: ['CANCELLED', 'REFUNDED'] }, createdAt: { $gte: today } } },
        { $group: { _id: "$customer", count: { $sum: 1 } } },
        { $match: { count: { $gte: 5 } } }
      ]);

      if (suspiciousUsers.length > 0) {
        for (const user of suspiciousUsers) {
          // Request human approval to suspend the user
          await this.requestApproval('FRAUD_SUSPENSION', { customerId: user._id }, { reason: 'High rate of cancellations/refunds today', count: user.count });
        }
      }

      await this.logExecution('AUTONOMOUS_RUN', 'Scan daily orders for fraud', 'Found ' + suspiciousUsers.length + ' suspicious users', 150, Date.now() - startTime, 'SUCCESS');
    } catch (error) {
      await this.logExecution('AUTONOMOUS_RUN', 'Scan daily orders for fraud', null, 0, Date.now() - startTime, 'FAILED', error.message);
    }
  }
}

module.exports = new FraudAgent();
