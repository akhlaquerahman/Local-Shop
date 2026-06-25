const GlobalCommissionRule = require('../models/GlobalCommissionRule');
const CategoryCommission = require('../models/CategoryCommission');
const SellerCommissionOverride = require('../models/SellerCommissionOverride');
const PromotionalCommissionRule = require('../models/PromotionalCommissionRule');
const DeliveryCommissionRule = require('../models/DeliveryCommissionRule');

class CommissionEngineService {
  /**
   * Calculates the commission breakdown for an order item.
   * Priority: Seller Override > Promotional Rule > Category Rule > Global Rule
   */
  static async calculateItemCommission(productPrice, categoryId, sellerId, shopId) {
    let appliedRule = null;
    let commissionPercent = 0;
    let gstPercent = 18; // Default
    let minFee = 0;
    let maxFee = Infinity;

    // Fetch Global Rule
    const globalRule = await GlobalCommissionRule.findOne() || new GlobalCommissionRule();
    
    // 1. Check Seller Override
    const sellerOverride = await SellerCommissionOverride.findOne({ sellerId, shopId, status: 'ACTIVE' });
    if (sellerOverride) {
      commissionPercent = sellerOverride.overrideCommission;
      appliedRule = 'Seller Override';
      gstPercent = globalRule.gst;
      minFee = globalRule.minCommission;
      maxFee = globalRule.maxCommission;
    } else {
      // 2. Check Promotional Rule
      const currentDate = new Date();
      const promoRule = await PromotionalCommissionRule.findOne({
        status: 'ACTIVE',
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        $or: [
          { appliesTo: 'ALL' },
          { appliesTo: 'SPECIFIC_CATEGORIES' }, // Would need more complex logic to check specific categories
          { appliesTo: 'SPECIFIC_SELLERS' }     // Would need more complex logic to check specific sellers
        ]
      }).sort({ commissionPercent: 1 }); // Give the lowest commission

      if (promoRule) {
        commissionPercent = promoRule.commissionPercent;
        appliedRule = 'Promotional Rule';
        gstPercent = globalRule.gst;
        minFee = globalRule.minCommission;
        maxFee = globalRule.maxCommission;
      } else {
        // 3. Check Category Rule
        const categoryRule = await CategoryCommission.findOne({ categoryId, status: 'ACTIVE' });
        if (categoryRule) {
          commissionPercent = categoryRule.commissionPercent;
          appliedRule = 'Category Rule';
          gstPercent = categoryRule.gstPercent;
          minFee = categoryRule.minFee;
          maxFee = categoryRule.maxFee || Infinity;
        } else {
          // 4. Fallback to Global Rule
          commissionPercent = globalRule.marketplaceCommission;
          appliedRule = 'Global Rule';
          gstPercent = globalRule.gst;
          minFee = globalRule.minCommission;
          maxFee = globalRule.maxCommission;
        }
      }
    }

    // Calculate actual amounts
    let platformCommission = (productPrice * commissionPercent) / 100;
    
    // Apply min/max limits
    if (platformCommission < minFee) platformCommission = minFee;
    if (platformCommission > maxFee) platformCommission = maxFee;

    const gstAmount = (platformCommission * gstPercent) / 100;
    const totalDeduction = platformCommission + gstAmount;
    const sellerEarnings = productPrice - totalDeduction;

    return {
      productPrice,
      appliedRule,
      commissionPercent,
      platformCommission,
      gstPercent,
      gstAmount,
      totalDeduction,
      sellerEarnings
    };
  }

  /**
   * Calculates delivery fee split
   */
  static async calculateDeliverySplit(deliveryFee) {
    const deliveryRule = await DeliveryCommissionRule.findOne() || new DeliveryCommissionRule();
    
    const platformDeliveryRevenue = (deliveryFee * deliveryRule.platformDeliveryFee) / 100;
    const riderEarnings = (deliveryFee * deliveryRule.riderEarnings) / 100;

    return {
      deliveryFee,
      platformDeliveryRevenue,
      riderEarnings,
      peakHourSurcharge: deliveryRule.peakHourSurcharge,
      rainSurcharge: deliveryRule.rainSurcharge,
      nightDeliveryFee: deliveryRule.nightDeliveryFee,
      expressDeliveryFee: deliveryRule.expressDeliveryFee
    };
  }
}

module.exports = CommissionEngineService;
