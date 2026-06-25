import { usersRoutes } from './users/routes/users.routes';
import { rolesRoutes } from './roles/routes/roles.routes';
import { permissionsRoutes } from './permissions/routes/permissions.routes';
import { shopsRoutes } from './shops/routes/shops.routes';
import { staffRoutes } from './staff/routes/staff.routes';
import { categoriesRoutes } from './categories/routes/categories.routes';
import { brandsRoutes } from './brands/routes/brands.routes';
import { productsRoutes } from './products/routes/products.routes';
import { variantsRoutes } from './variants/routes/variants.routes';
import { attributesRoutes } from './attributes/routes/attributes.routes';
import { collectionsRoutes } from './collections/routes/collections.routes';
import { inventoryRoutes } from './inventory/routes/inventory.routes';
import { ordersRoutes } from './orders/routes/orders.routes';
import { orderitemsRoutes } from './order-items/routes/order-items.routes';
import { deliveriesRoutes } from './deliveries/routes/deliveries.routes';
import { dispatchRoutes } from './dispatch/routes/dispatch.routes';
import { trackingRoutes } from './tracking/routes/tracking.routes';
import { returnsRoutes } from './returns/routes/returns.routes';
import { deliveryrequestsRoutes } from './delivery-requests/routes/delivery-requests.routes';
import { paymentsRoutes } from './payments/routes/payments.routes';
import { refundsRoutes } from './refunds/routes/refunds.routes';
import { invoicesRoutes } from './invoices/routes/invoices.routes';
import { ledgersRoutes } from './ledgers/routes/ledgers.routes';
import { taxreportsRoutes } from './tax-reports/routes/tax-reports.routes';
import { walletsRoutes } from './wallets/routes/wallets.routes';
import { wallettransactionsRoutes } from './wallet-transactions/routes/wallet-transactions.routes';
import { commissionsRoutes } from './commissions/routes/commissions.routes';
import { payoutsRoutes } from './payouts/routes/payouts.routes';
import { subscriptionsRoutes } from './subscriptions/routes/subscriptions.routes';
import { reviewsRoutes } from './reviews/routes/reviews.routes';
import { ratingsRoutes } from './ratings/routes/ratings.routes';
import { couponsRoutes } from './coupons/routes/coupons.routes';
import { promotionsRoutes } from './promotions/routes/promotions.routes';
import { referralsRoutes } from './referrals/routes/referrals.routes';
import { campaignsRoutes } from './campaigns/routes/campaigns.routes';
import { seoRoutes } from './seo/routes/seo.routes';
import { affiliatesRoutes } from './affiliates/routes/affiliates.routes';
import { notificationsRoutes } from './notifications/routes/notifications.routes';
import { chatRoutes } from './chat/routes/chat.routes';
import { supportRoutes } from './support/routes/support.routes';
import { ticketsRoutes } from './tickets/routes/tickets.routes';
import { disputesRoutes } from './disputes/routes/disputes.routes';
import { analyticsRoutes } from './analytics/routes/analytics.routes';
import { reportsRoutes } from './reports/routes/reports.routes';
import { cmspagesRoutes } from './cms-pages/routes/cms-pages.routes';
import { blogsRoutes } from './blogs/routes/blogs.routes';
import { faqRoutes } from './faq/routes/faq.routes';
import { emailtemplatesRoutes } from './email-templates/routes/email-templates.routes';
import { smstemplatesRoutes } from './sms-templates/routes/sms-templates.routes';
import { pushtemplatesRoutes } from './push-templates/routes/push-templates.routes';
import { citiesRoutes } from './cities/routes/cities.routes';
import { zonesRoutes } from './zones/routes/zones.routes';
import { addressRoutes } from './address/routes/address.routes';
import { geofencingRoutes } from './geofencing/routes/geofencing.routes';
import { routingRoutes } from './routing/routes/routing.routes';
import { kycRoutes } from './kyc/routes/kyc.routes';
import { fraudRoutes } from './fraud/routes/fraud.routes';
import { auditlogsRoutes } from './audit-logs/routes/audit-logs.routes';
import { settingsRoutes } from './settings/routes/settings.routes';
import { integrationsRoutes } from './integrations/routes/integrations.routes';
import { bannersRoutes } from './banners/routes/banners.routes';
import { advertisementsRoutes } from './advertisements/routes/advertisements.routes';
import { filesRoutes } from './files/routes/files.routes';
import { mediaRoutes } from './media/routes/media.routes';
import { searchRoutes } from './search/routes/search.routes';
import { dashboardRoutes } from './dashboard/routes/dashboard.routes';
import { sessionsRoutes } from './sessions/routes/sessions.routes';
import { otpRoutes } from './otp/routes/otp.routes';
import { passwordsRoutes } from './passwords/routes/passwords.routes';
import { socialauthRoutes } from './social-auth/routes/social-auth.routes';
import { authRoutes } from './auth/routes/auth.routes';
import { refreshtokensRoutes } from './refresh-tokens/routes/refresh-tokens.routes';
import { cartRoutes } from './cart/routes/cart.routes';
import { wishlistRoutes } from './wishlist/routes/wishlist.routes';
import { addressesRoutes } from './addresses/routes/addresses.routes';
import { paymentmethodsRoutes } from './payment-methods/routes/payment-methods.routes';
import { activitylogsRoutes } from './activity-logs/routes/activity-logs.routes';
import { sellersettingsRoutes } from './seller-settings/routes/seller-settings.routes';
import { ridersettingsRoutes } from './rider-settings/routes/rider-settings.routes';
export const AppModules = [
  usersRoutes,
  rolesRoutes,
  permissionsRoutes,
  shopsRoutes,
  staffRoutes,
  categoriesRoutes,
  brandsRoutes,
  productsRoutes,
  variantsRoutes,
  attributesRoutes,
  collectionsRoutes,
  inventoryRoutes,
  ordersRoutes,
  orderitemsRoutes,
  deliveriesRoutes,
  dispatchRoutes,
  trackingRoutes,
  returnsRoutes,
  deliveryrequestsRoutes,
  paymentsRoutes,
  refundsRoutes,
  invoicesRoutes,
  ledgersRoutes,
  taxreportsRoutes,
  walletsRoutes,
  wallettransactionsRoutes,
  commissionsRoutes,
  payoutsRoutes,
  subscriptionsRoutes,
  reviewsRoutes,
  ratingsRoutes,
  couponsRoutes,
  promotionsRoutes,
  referralsRoutes,
  campaignsRoutes,
  seoRoutes,
  affiliatesRoutes,
  notificationsRoutes,
  chatRoutes,
  supportRoutes,
  ticketsRoutes,
  disputesRoutes,
  analyticsRoutes,
  reportsRoutes,
  cmspagesRoutes,
  blogsRoutes,
  faqRoutes,
  emailtemplatesRoutes,
  smstemplatesRoutes,
  pushtemplatesRoutes,
  citiesRoutes,
  zonesRoutes,
  addressRoutes,
  geofencingRoutes,
  routingRoutes,
  kycRoutes,
  fraudRoutes,
  auditlogsRoutes,
  settingsRoutes,
  integrationsRoutes,
  bannersRoutes,
  advertisementsRoutes,
  filesRoutes,
  mediaRoutes,
  searchRoutes,
  dashboardRoutes,
  sessionsRoutes,
  otpRoutes,
  passwordsRoutes,
  socialauthRoutes,
  authRoutes,
  refreshtokensRoutes,
  cartRoutes,
  wishlistRoutes,
  addressesRoutes,
  paymentmethodsRoutes,
  activitylogsRoutes,
  sellersettingsRoutes,
  ridersettingsRoutes
];
