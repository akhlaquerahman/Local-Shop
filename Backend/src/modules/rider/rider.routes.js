const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const riderController = require('./rider.controller');

router.use(requireAuth);
// Assuming role check if needed, else just requireAuth
// router.use(requireRole(['DELIVERY_PARTNER']));

router.get('/dashboard', riderController.getDashboard);
router.get('/deliveries/available', riderController.getAvailableDeliveries);
router.post('/deliveries/:id/request', riderController.requestDelivery);
router.get('/requests', riderController.getRequests);
router.get('/deliveries/assigned', riderController.getAssignedDeliveries);
router.patch('/deliveries/:id/status', riderController.updateDeliveryStatus);

router.get('/deliveries/in-transit', riderController.getInTransitDelivery);
router.get('/deliveries/completed', riderController.getCompletedDeliveries);
router.get('/deliveries/failed', riderController.getFailedDeliveries);
router.get('/earnings', riderController.getEarnings);
router.get('/payouts', riderController.getPayouts);

// RETURNS & PICKUPS
const riderReturnsController = require('./rider.returns.controller');
router.get('/return-pickups', riderReturnsController.getReturnPickups);
router.put('/return-pickups/:id/start', riderReturnsController.startPickup);
router.put('/return-pickups/:id/complete', riderReturnsController.completePickup);

// PHASE 3 ROUTES
router.get('/wallet', riderController.getWallet);
router.get('/ratings', riderController.getRatings);

// SERVICE AREAS
router.get('/service-areas', riderController.getServiceAreas);
router.post('/service-areas', riderController.addServiceArea);
router.patch('/service-areas/:id', riderController.updateServiceArea);
router.delete('/service-areas/:id', riderController.deleteServiceArea);

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.get('/documents', riderController.getDocuments);
router.post('/documents', upload.fields([{ name: 'frontImage', maxCount: 1 }, { name: 'backImage', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), riderController.uploadDocument);
router.get('/kyc', riderController.getKycStatus);
router.get('/notifications', riderController.getNotifications);
router.patch('/notifications/read', riderController.readNotifications);
router.get('/support/tickets', riderController.getSupportTickets);
router.post('/support/tickets', riderController.createSupportTicket);
router.get('/profile', riderController.getProfile);
router.patch('/profile', riderController.updateProfile);
router.get('/security', riderController.getSecurity);
router.patch('/security', riderController.updateSecurity);
router.get('/settings', riderController.getSettings);
router.patch('/settings', riderController.updateSettings);

module.exports = router;
