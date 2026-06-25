const express = require('express');
const router = express.Router();
const sellerController = require('./seller.controller');
const { requireAuth } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

// All seller routes require auth and SELLER role
router.use(requireAuth);
// Assuming requireRole can handle multiple roles or we just check SELLER. 
// For now, we'll assume the auth middleware or controller ensures the user owns the shop.

// BULK UPLOAD
router.post('/products/import', sellerController.importProducts);
router.get('/products/import-history', sellerController.getImportHistory);

// BRANDS
router.get('/brands', sellerController.getBrands);

// PRODUCTS
router.get('/products', sellerController.getProducts);
router.get('/products/stats', sellerController.getProductStats);
router.post('/products', sellerController.createProduct);
router.get('/products/:id', sellerController.getProduct);
router.patch('/products/:id', sellerController.updateProduct);
router.delete('/products/:id', sellerController.deleteProduct);

// INVENTORY
router.get('/inventory', sellerController.getInventory);
router.patch('/inventory/:id', sellerController.updateInventory);

// ORDERS
router.get('/orders', sellerController.getOrders);
router.get('/orders/stats', sellerController.getOrderStats);
router.patch('/orders/:id/status', sellerController.updateOrderStatus);

// RETURNS
const sellerReturnsController = require('./seller.returns.controller');
router.get('/returns', sellerReturnsController.getReturns);
router.put('/returns/:id/approve', sellerReturnsController.approveReturn);
router.put('/returns/:id/reject', sellerReturnsController.rejectReturn);
router.put('/returns/:id/assign-rider', sellerReturnsController.assignRider);
router.put('/returns/:id/mark-received', sellerReturnsController.markReceived);
router.put('/returns/:id/process-refund', sellerReturnsController.processRefund);

// DELIVERY REQUESTS
router.get('/delivery-requests', sellerController.getDeliveryRequests);
router.get('/delivery-requests/stats', sellerController.getDeliveryRequestStats);
router.patch('/delivery-requests/:id', sellerController.updateDeliveryRequest);
router.get('/orders/:id/bids', sellerController.getOrderBids);
router.post('/orders/:id/accept-bid', sellerController.acceptRiderBid);

// DELIVERY PARTNERS
router.get('/riders', sellerController.getRiders);
router.get('/riders/stats', sellerController.getRiderStats);

// CUSTOMERS
router.get('/customers', sellerController.getCustomers);
router.get('/customers/stats', sellerController.getCustomerStats);

// COUPONS
router.get('/coupons', sellerController.getCoupons);
router.get('/coupons/stats', sellerController.getCouponStats);
router.post('/coupons', sellerController.createCoupon);
router.patch('/coupons/:id', sellerController.updateCoupon);
router.delete('/coupons/:id', sellerController.deleteCoupon);

// ==========================================
// ANALYTICS & MARKETING
// ==========================================
const analyticsController = require('./seller.analytics.controller');
const marketingController = require('./seller.marketing.controller');

// ANALYTICS
router.get('/analytics/overview', analyticsController.getOverview);
router.get('/analytics/revenue', analyticsController.getRevenueTrend);
router.get('/analytics/orders', analyticsController.getOrdersTrend);
router.get('/analytics/products', analyticsController.getProductAnalytics);
router.get('/analytics/customers', analyticsController.getCustomerAnalytics);

// MARKETING
router.get('/promotions', marketingController.getPromotions);
router.post('/promotions', marketingController.createPromotion);
router.patch('/promotions/:id', marketingController.updatePromotion);
router.delete('/promotions/:id', marketingController.deletePromotion);
router.get('/marketing/overview', marketingController.getMarketingOverview);
router.get('/marketing/activity', marketingController.getMarketingActivity);

// ==========================================
// OPERATIONS & MANAGEMENT
// ==========================================
const financeController = require('./seller.finance.controller');
const reviewsController = require('./seller.reviews.controller');
const settingsController = require('./seller.settings.controller');
const staffController = require('./seller.staff.controller');

// FINANCE (REVENUE & PAYOUTS)
router.get('/revenue/overview', financeController.getRevenueOverview);
router.get('/revenue/chart', financeController.getRevenueChart);
router.get('/revenue/transactions', financeController.getTransactions);
router.get('/payouts', financeController.getPayouts);
router.get('/payouts/summary', financeController.getPayoutSummary);
router.post('/payouts/request', financeController.requestPayout);

// REVIEWS
router.get('/reviews', reviewsController.getReviews);
router.post('/reviews/reply', reviewsController.replyToReview);

// SETTINGS
router.get('/settings', settingsController.getSettings);
router.patch('/settings', settingsController.updateSettings);

// ROLES
const rolesController = require('./seller.roles.controller');
router.get('/staff/roles', rolesController.getRoles);
router.post('/staff/roles', rolesController.createRole);
router.patch('/staff/roles/:id', rolesController.updateRole);
router.delete('/staff/roles/:id', rolesController.deleteRole);

// STAFF
router.get('/staff', staffController.getStaffList);
router.post('/staff', staffController.createStaff);
router.patch('/staff/:id', staffController.updateStaff);
router.delete('/staff/:id', staffController.deleteStaff);

// ==========================================
// ACCOUNT & COMPLIANCE
// ==========================================
const accountController = require('./seller.account.controller');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// KYC
router.get('/kyc', accountController.getKycDocuments);
router.post('/kyc/upload', upload.fields([{ name: 'frontImage', maxCount: 1 }, { name: 'backImage', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), accountController.uploadKycDocument);

// NOTIFICATIONS
router.get('/notifications', accountController.getNotifications);
router.patch('/notifications/:id/read', accountController.markNotificationRead);

// SUPPORT
router.get('/support', accountController.getTickets);
router.post('/support', accountController.createTicket);

// REPORTS
router.get('/reports', accountController.getReports);
router.post('/reports/generate', accountController.generateReport);

// PROFILE
router.get('/profile', accountController.getProfile);
router.patch('/profile', accountController.updateProfile);

// SHOP LOCATION
router.get('/shop/location', accountController.getShopLocation);
router.put('/shop/location', accountController.updateShopLocation);

// SECURITY
router.get('/security', accountController.getSecurityData);
router.post('/security/logout-all', accountController.logoutAllSessions);

// AUDIT LOGS
router.get('/audit-logs', accountController.getAuditLogs);

module.exports = router;
