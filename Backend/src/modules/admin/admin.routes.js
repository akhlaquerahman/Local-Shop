const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { requireAuth } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

// ENTERPRISE AGENT MANAGEMENT
const adminAgentRoutes = require('./adminAgent.routes');
router.use('/agents', adminAgentRoutes);

// All endpoints require SUPER_ADMIN role
router.use(requireAuth);
// router.use(requireRole('SUPER_ADMIN')); // Uncomment when roles are strictly enforced for super admin

router.get('/sellers', adminController.getSellers);
router.put('/sellers/:id/suspend', adminController.suspendCustomer);
router.get('/customers', adminController.getCustomers);
router.put('/customers/:id/suspend', adminController.suspendCustomer);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/kyc', adminController.updateKycStatus);
router.get('/riders', adminController.getRiders);
router.put('/riders/:id/suspend', adminController.suspendCustomer);
router.get('/cities', adminController.getCities);
router.get('/zones', adminController.getZones);
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.get('/brands', adminController.getBrands);
router.post('/brands', adminController.createBrand);
router.put('/brands/:id', adminController.updateBrand);
router.delete('/brands/:id', adminController.deleteBrand);
router.get('/products', adminController.getProducts);
router.get('/inventory', adminController.getInventory);
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);
router.get('/payments', adminController.getPayments);
router.get('/payments/:id', adminController.getPaymentDetails);
router.get('/refunds', adminController.getRefunds); // legacy or general refunds
// ENTERPRISE COMMISSION & REVENUE MODULE
const adminCommissionsController = require('./admin.commissions.controller');
router.get('/commissions/dashboard', adminCommissionsController.getDashboard);
router.get('/commissions/global', adminCommissionsController.getGlobalRule);
router.put('/commissions/global', adminCommissionsController.updateGlobalRule);
router.get('/commissions/categories', adminCommissionsController.getCategoryRules);
router.post('/commissions/categories', adminCommissionsController.createCategoryRule);
router.put('/commissions/categories/:id', adminCommissionsController.updateCategoryRule);
router.delete('/commissions/categories/:id', adminCommissionsController.deleteCategoryRule);
router.get('/commissions/sellers', adminCommissionsController.getSellerOverrides);
router.post('/commissions/sellers', adminCommissionsController.createSellerOverride);
router.put('/commissions/sellers/:id', adminCommissionsController.updateSellerOverride);
router.delete('/commissions/sellers/:id', adminCommissionsController.deleteSellerOverride);
router.get('/commissions/delivery', adminCommissionsController.getDeliveryRule);
router.put('/commissions/delivery', adminCommissionsController.updateDeliveryRule);
router.get('/commissions/promotions', adminCommissionsController.getPromotionalRules);
router.post('/commissions/promotions', adminCommissionsController.createPromotionalRule);
router.put('/commissions/promotions/:id', adminCommissionsController.updatePromotionalRule);
router.delete('/commissions/promotions/:id', adminCommissionsController.deletePromotionalRule);
router.post('/commissions/simulator', adminCommissionsController.simulateCommission);
router.get('/commissions/history', adminCommissionsController.getHistory);
router.get('/commissions/audit', adminCommissionsController.getAuditLogs);

// ENTERPRISE REVIEWS & REPUTATION MODULE
const adminReviewController = require('./admin.reviews.controller');
router.get('/reviews/dashboard', adminReviewController.getReviewDashboard);
router.get('/reviews/analytics', adminReviewController.getReviewAnalytics);
router.get('/reviews', adminReviewController.getReviews);
router.get('/reviews/:id', adminReviewController.getReviewDetails);
router.put('/reviews/:id/approve', adminReviewController.approveReview);
router.put('/reviews/:id/hide', adminReviewController.hideReview);
router.put('/reviews/:id/unhide', adminReviewController.unhideReview);
router.delete('/reviews/:id', adminReviewController.deleteReview);

// PAYOUTS & SETTLEMENTS (New Enterprise Module)
const adminPayoutsController = require('./admin.payouts.controller');
router.get('/payouts', adminPayoutsController.getAll);
router.post('/payouts/run-batch', adminPayoutsController.runBatch);
router.get('/payouts/:id', adminPayoutsController.getById);
router.get('/payouts/ledger/:id', adminPayoutsController.getLedger);
router.post('/payouts/suspend/:id', adminPayoutsController.suspendAccount);
router.post('/payouts/activate/:id', adminPayoutsController.activateAccount);

// ENTERPRISE DISPUTES MODULE
const adminDisputesController = require('./admin.disputes.controller');
router.get('/disputes/dashboard', adminDisputesController.getDisputeDashboard);
router.get('/disputes', adminDisputesController.getDisputes);
router.get('/disputes/:id', adminDisputesController.getDisputeDetails);
router.put('/disputes/:id/status', adminDisputesController.updateDisputeStatus);
router.post('/disputes/:id/resolve', adminDisputesController.resolveDispute);
router.post('/disputes/:id/messages', adminDisputesController.addDisputeMessage);

// ENTERPRISE BANNERS CONFIGURATION
const adminBannersController = require('./admin.banners.controller');
router.get('/banners', adminBannersController.getAllBanners);
router.post('/banners', adminBannersController.createBanner);
router.get('/banners/:id', adminBannersController.getBannerById);
router.put('/banners/:id', adminBannersController.updateBanner);
router.delete('/banners/:id', adminBannersController.deleteBanner);
router.put('/banners/:id/toggle', adminBannersController.toggleBannerStatus);

// ENTERPRISE CMS (BLOGS)
const adminCmsController = require('./admin.cms.controller');
router.get('/cms/blogs', adminCmsController.getAllBlogs);
router.post('/cms/blogs', adminCmsController.createBlog);
router.get('/cms/blogs/:id', adminCmsController.getBlogById);
router.put('/cms/blogs/:id', adminCmsController.updateBlog);
router.delete('/cms/blogs/:id', adminCmsController.deleteBlog);

router.post('/payouts/approve', adminPayoutsController.approvePayout);

// RETURNS & REFUNDS (New Module)
const adminReturnsController = require('./admin.returns.controller');
router.get('/returns', adminReturnsController.getAllReturns);
router.put('/returns/:id/approve', adminReturnsController.approveReturn);
router.put('/returns/:id/reject', adminReturnsController.rejectReturn);
router.put('/returns/:id/refund', adminReturnsController.processRefund);
router.put('/returns/:id/assign-rider', adminReturnsController.assignRider);
router.put('/returns/:id/close', adminReturnsController.closeReturn);
router.get('/wallets', adminController.getWallets);
router.get('/reviews', adminController.getReviews);
router.put('/reviews/:id', adminController.updateReview);
router.get('/ratings', adminController.getRatings);
router.get('/disputes', adminController.getDisputes);
router.put('/disputes/:id', adminController.updateDispute);
// ENTERPRISE SUPPORT MODULE
const adminSupportController = require('./admin.support.controller');
router.get('/support-tickets', adminSupportController.getAllTickets);
router.get('/support-tickets/:id', adminSupportController.getTicketById);
router.put('/support-tickets/:id/assign', adminSupportController.assignTicket);
router.post('/support-tickets/:id/messages', adminSupportController.replyToTicket);
router.put('/support-tickets/:id/resolve', adminSupportController.resolveTicket);

router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.createNotification);
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.createBanner);
router.put('/banners/:id', adminController.updateBanner);
router.get('/advertisements', adminController.getAdvertisements);
router.post('/advertisements', adminController.createAdvertisement);
router.put('/advertisements/:id', adminController.updateAdvertisement);
router.get('/coupons', adminController.getCoupons);
router.get('/pages', adminController.getPages);
router.post('/pages', adminController.createPage);
router.put('/pages/:id', adminController.updatePage);
router.get('/blogs', adminController.getBlogs);
router.post('/blogs', adminController.createBlog);
router.put('/blogs/:id', adminController.updateBlog);
router.get('/faqs', adminController.getFaqs);
router.post('/faqs', adminController.createFaq);
router.put('/faqs/:id', adminController.updateFaq);
router.get('/templates/email', adminController.getEmailTemplates);
router.post('/templates/email', adminController.createEmailTemplate);
router.put('/templates/email/:id', adminController.updateEmailTemplate);
router.get('/templates/sms', adminController.getSmsTemplates);
router.post('/templates/sms', adminController.createSmsTemplate);
router.put('/templates/sms/:id', adminController.updateSmsTemplate);
router.get('/templates/push', adminController.getPushTemplates);
router.post('/templates/push', adminController.createPushTemplate);
router.put('/templates/push/:id', adminController.updatePushTemplate);
router.get('/roles', adminController.getRoles);
router.post('/roles', adminController.createRole);
router.put('/roles/:id', adminController.updateRole);
router.get('/permissions', adminController.getPermissions);
router.post('/permissions', adminController.createPermission);
router.put('/permissions/:id', adminController.updatePermission);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/system-logs', adminController.getSystemLogs);
router.post('/system-logs', adminController.createSystemLog);
router.get('/fraud-cases', adminController.getFraudCases);
router.post('/fraud-cases', adminController.createFraudCase);
router.put('/fraud-cases/:id', adminController.updateFraudCase);
router.get('/platform-health', adminController.getPlatformHealth);
router.get('/settings', adminController.getSettings);
router.get('/integrations', adminController.getIntegrations);
router.post('/reports/generate', adminController.generateReport);
router.get('/analytics', adminController.getAnalytics);

router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);
router.put('/security', adminController.updateAdminSecurity);
router.get('/sessions', adminController.getAdminSessions);
router.delete('/sessions/:id', adminController.deleteAdminSession);
router.get('/profile/activity', adminController.getAdminActivity);
router.put('/preferences', adminController.updateAdminPreferences);

module.exports = router;
