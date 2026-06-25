const Product = require('../../../models/Product');
const Order = require('../../../models/Order');

class RecommendationEngine {
  async getProductRecommendations(userId) {
    // Basic heuristic: Find top 5 best selling active products
    // In production, this would use collaborative filtering or Vector similarities
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          count: { $sum: "$items.quantity" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const productIds = topProducts.map(p => p._id);
    const recommended = await Product.find({ _id: { $in: productIds }, status: 'active' }).select('name price images');
    
    return recommended;
  }
}

module.exports = new RecommendationEngine();
