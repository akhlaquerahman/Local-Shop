const Order = require('../../../models/Order');

class InsightEngine {
  async generateSellerInsights(sellerId) {
    // Advanced Aggregation Pipeline for Seller Trends
    const trends = await Order.aggregate([
      { $match: { seller: sellerId, status: 'DELIVERED' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    return {
      type: 'SELLER_INSIGHT',
      summary: 'Sales have shown a steady trend over the last 30 days.',
      data: trends.map(t => ({ name: t._id, value: t.revenue }))
    };
  }

  async generatePlatformInsights() {
    // Admin GMV Aggregation
    const gmv = await Order.aggregate([
      { $match: { status: { $in: ['DELIVERED', 'SHIPPED'] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          gmv: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      type: 'PLATFORM_GMV_INSIGHT',
      summary: 'Monthly Gross Merchandise Value',
      data: gmv.map(t => ({ name: t._id, value: t.gmv }))
    };
  }
}

module.exports = new InsightEngine();
