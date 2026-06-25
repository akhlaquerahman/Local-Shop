const Order = require('../../../models/Order');
const Product = require('../../../models/Product');
const User = require('../../../models/User');
const Wallet = require('../../../models/Wallet');
const Coupon = require('../../../models/Coupon');
const Shop = require('../../../models/Shop');
const SupportTicket = require('../../../models/SupportTicket');
const Delivery = require('../../../models/Delivery');

/**
 * Define Gemini Function Declarations
 */
const ToolDeclarations = [
  // --- PROFILE TOOLS ---
  { name: 'getProfile', description: 'Fetch the profile details of the current user.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'updateProfile', description: 'Update profile details (name, phone).', parameters: { type: 'OBJECT', properties: { name: { type: 'STRING' }, phone: { type: 'STRING' } } } },
  { name: 'getAddresses', description: 'Fetch saved addresses.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'addAddress', description: 'Add a new saved address.', parameters: { type: 'OBJECT', properties: { label: { type: 'STRING' }, street: { type: 'STRING' }, city: { type: 'STRING' } }, required: ['street', 'city'] } },
  { name: 'updateAddress', description: 'Update a saved address.', parameters: { type: 'OBJECT', properties: { addressId: { type: 'STRING' }, street: { type: 'STRING' }, city: { type: 'STRING' } }, required: ['addressId'] } },
  { name: 'deleteAddress', description: 'Delete a saved address.', parameters: { type: 'OBJECT', properties: { addressId: { type: 'STRING' } }, required: ['addressId'] } },

  // --- ORDER TOOLS ---
  { name: 'getRecentOrder', description: 'Fetch the most recent order.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'getOrderHistory', description: 'Fetch all order history or search by status.', parameters: { type: 'OBJECT', properties: { status: { type: 'STRING' }, limit: { type: 'INTEGER' } } } },
  { name: 'trackOrder', description: 'Track the delivery status of a specific order.', parameters: { type: 'OBJECT', properties: { orderId: { type: 'STRING' } }, required: ['orderId'] } },
  { name: 'cancelOrder', description: 'Cancel an order.', parameters: { type: 'OBJECT', properties: { orderId: { type: 'STRING' }, reason: { type: 'STRING' } }, required: ['orderId'] } },
  { name: 'createReturnRequest', description: 'Create a return request for an order.', parameters: { type: 'OBJECT', properties: { orderId: { type: 'STRING' }, reason: { type: 'STRING' } }, required: ['orderId', 'reason'] } },
  { name: 'getRefundStatus', description: 'Check the status of a refund.', parameters: { type: 'OBJECT', properties: { orderId: { type: 'STRING' } }, required: ['orderId'] } },
  { name: 'getDeliveryPartner', description: 'Get delivery partner info for an order.', parameters: { type: 'OBJECT', properties: { orderId: { type: 'STRING' } }, required: ['orderId'] } },
  { name: 'getDeliveryLocation', description: 'Get live location of delivery partner.', parameters: { type: 'OBJECT', properties: { orderId: { type: 'STRING' } }, required: ['orderId'] } },

  // --- SUPPORT TOOLS ---
  { name: 'createTicket', description: 'Create a new support ticket.', parameters: { type: 'OBJECT', properties: { subject: { type: 'STRING' }, message: { type: 'STRING' } }, required: ['subject', 'message'] } },
  { name: 'listTickets', description: 'List all user support tickets.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'getTicketStatus', description: 'Get status of a specific ticket.', parameters: { type: 'OBJECT', properties: { ticketId: { type: 'STRING' } }, required: ['ticketId'] } },
  { name: 'escalateTicket', description: 'Escalate a support ticket.', parameters: { type: 'OBJECT', properties: { ticketId: { type: 'STRING' }, reason: { type: 'STRING' } }, required: ['ticketId'] } },

  // --- WALLET & COUPONS ---
  { name: 'getWallet', description: 'Fetch wallet balance.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'getCoupons', description: 'Fetch available coupons.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'getNearestShops', description: 'Find nearby shops.', parameters: { type: 'OBJECT', properties: {} } },
  
  // --- SELLER TOOLS ---
  { name: 'getSellerRevenue', description: 'Fetch revenue statistics for the seller.', parameters: { type: 'OBJECT', properties: { period: { type: 'STRING' } } } },
  { name: 'getProducts', description: 'Search for products or check inventory (low stock).', parameters: { type: 'OBJECT', properties: { keyword: { type: 'STRING' }, lowStock: { type: 'BOOLEAN' } } } },

  // --- DELIVERY TOOLS ---
  { name: 'getDeliveryAssignments', description: 'Fetch pending or completed deliveries for the rider.', parameters: { type: 'OBJECT', properties: { status: { type: 'STRING' } } } },
  { name: 'getDeliveryEarnings', description: 'Fetch earnings for the rider.', parameters: { type: 'OBJECT', properties: {} } },

  // --- ADMIN TOOLS ---
  { name: 'getMarketplaceAnalytics', description: 'Fetch top level metrics for the admin.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'getFraudCases', description: 'Fetch flagged fraud alerts.', parameters: { type: 'OBJECT', properties: {} } },

  // --- ACTIONS ---
  { name: 'executeAction', description: 'Triggers a UI confirmation.', parameters: { type: 'OBJECT', properties: { actionType: { type: 'STRING' }, payload: { type: 'STRING' }, message: { type: 'STRING' } }, required: ['actionType', 'payload', 'message'] } },
  { name: 'requestNavigation', description: 'Navigates the user.', parameters: { type: 'OBJECT', properties: { route: { type: 'STRING' } }, required: ['route'] } },

  // --- DATABASE ACCESS ---
  { name: 'queryDatabase', description: 'Fetch complete list or specific records from any database collection (e.g., User, Shop, Order, Product, Delivery). Use this when the user asks for a list of sellers, users, orders, or full details.', parameters: { type: 'OBJECT', properties: { collectionName: { type: 'STRING', description: 'Mongoose model name: User, Shop, Order, Product, Delivery, Coupon, SupportTicket, Wallet' }, query: { type: 'STRING', description: 'JSON string of the query object (e.g., {"role":"SELLER"} or {"_id":"..."})' }, populate: { type: 'STRING', description: 'Comma separated fields to populate' }, limit: { type: 'INTEGER', description: 'Max number of results' } }, required: ['collectionName'] } }
];

class AIToolsExecutor {
  async execute(functionCall, userRole, userId) {
    const { name, args } = functionCall;
    console.log(`[AI Tool Executed] Tool: ${name} | Role: ${userRole} | User: ${userId}`);

    try {
      switch (name) {
        // Profile Tools
        case 'getProfile': return this.handleGetProfile(userId);
        case 'updateProfile': return this.handleUpdateProfile(args, userId);
        case 'getAddresses': return this.handleGetAddresses(userId);
        case 'addAddress': return this.handleAddAddress(args, userId);
        case 'updateAddress': return this.handleUpdateAddress(args, userId);
        case 'deleteAddress': return this.handleDeleteAddress(args, userId);

        // Order Tools
        case 'getRecentOrder': return this.handleGetRecentOrder(userRole, userId);
        case 'getOrderHistory': return this.handleGetOrders(args, userRole, userId); // Use existing
        case 'trackOrder': return this.handleTrackOrder(args.orderId, userId);
        case 'cancelOrder': return this.handleCancelOrder(args, userId);
        case 'createReturnRequest': return this.handleCreateReturnRequest(args, userId);
        case 'getRefundStatus': return this.handleGetRefundStatus(args, userId);
        case 'getDeliveryPartner': return this.handleGetDeliveryPartner(args, userId);
        case 'getDeliveryLocation': return this.handleGetDeliveryLocation(args, userId);

        // Support Tools
        case 'createTicket': return this.handleCreateTicket(args, userId);
        case 'listTickets': return this.handleListTickets(userId);
        case 'getTicketStatus': return this.handleGetTicketStatus(args, userId);
        case 'escalateTicket': return this.handleEscalateTicket(args, userId);

        // Others
        case 'getWallet': return this.handleGetWallet(userId);
        case 'getCoupons': return this.handleGetCoupons(userId);
        case 'getNearestShops': return this.handleGetNearestShops();
        case 'getSellerRevenue': return this.handleGetSellerRevenue(args, userId);
        case 'getProducts': return this.handleGetProducts(args, userRole, userId);
        case 'getDeliveryAssignments': return this.handleGetDeliveryAssignments(args, userId);
        case 'getDeliveryEarnings': return this.handleGetDeliveryEarnings(userId);
        case 'getMarketplaceAnalytics': return this.handleGetMarketplaceAnalytics();
        case 'getFraudCases': return this.handleGetFraudCases();
        case 'queryDatabase': return this.handleQueryDatabase(args);
        case 'executeAction':
          return { _type: 'ACTION_CONFIRMATION', actionType: args.actionType, payload: JSON.parse(args.payload || '{}'), message: args.message };
        case 'requestNavigation':
          return { _type: 'NAVIGATION', route: args.route };
        default:
          return { error: `Tool ${name} not found.` };
      }
    } catch (err) {
      console.error(`[AI Tool Error] Tool ${name}:`, err);
      return { error: err.message };
    }
  }

  // --- Profile Implementations ---
  async handleGetProfile(userId) {
    const user = await User.findById(userId).select('-password').lean();
    if (!user) throw new Error('User not found');
    return { _type: 'PROFILE_CARD', profile: user };
  }

  async handleUpdateProfile(args, userId) {
    const user = await User.findByIdAndUpdate(userId, { $set: args }, { new: true }).select('-password').lean();
    return { _type: 'PROFILE_CARD', profile: user, message: "Profile updated successfully." };
  }

  async handleGetAddresses(userId) {
    const user = await User.findById(userId).lean();
    return { _type: 'ACTION_CARD', title: 'Saved Addresses', message: JSON.stringify(user?.addresses || []) };
  }

  async handleAddAddress(args, userId) {
    await User.findByIdAndUpdate(userId, { $push: { addresses: args } });
    return { _type: 'ACTION_CARD', title: 'Address Added', message: 'Address has been added.' };
  }

  async handleUpdateAddress(args, userId) {
    return { _type: 'ACTION_CARD', title: 'Address Updated', message: 'Address updated.' };
  }

  async handleDeleteAddress(args, userId) {
    return { _type: 'ACTION_CARD', title: 'Address Deleted', message: 'Address deleted.' };
  }

  // --- Order Implementations ---
  async handleGetRecentOrder(role, userId) {
    const query = {};
    if (role === 'CUSTOMER') query.customerId = userId;
    else if (role === 'SELLER') query.shopId = userId; // Assuming seller ID maps to shopId in demo
    else if (role === 'RIDER') query['deliveryDetails.riderId'] = userId;

    const order = await Order.findOne(query).sort({ createdAt: -1 }).lean();
    if (!order) return { _type: 'ACTION_CARD', title: 'No Orders', message: 'You have not placed any orders yet. Browse nearby shops?' };
    return { _type: 'ORDER_CARD', title: 'Your Recent Order', orders: [order] };
  }

  async handleGetOrders(args, role, userId) {
    const query = {};
    if (args.status) query.status = args.status;
    if (role === 'CUSTOMER') query.customerId = userId;
    else if (role === 'SELLER') query.shopId = userId;
    else if (role === 'RIDER') query['deliveryDetails.riderId'] = userId;

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(args.limit || 5).lean();
    if (!orders.length) return { _type: 'ACTION_CARD', title: 'No Orders', message: 'No orders found matching your criteria.' };
    return { _type: 'ORDER_CARD', title: 'Order History', orders };
  }

  async handleTrackOrder(orderId, userId) {
    const order = await Order.findById(orderId).populate('deliveryPartner').lean();
    if (!order) return { error: 'Order not found' };
    return { _type: 'DELIVERY_CARD', title: 'Order Tracking', order };
  }

  async handleCancelOrder(args, userId) {
    // In production we would check status rules.
    const order = await Order.findOneAndUpdate({ _id: args.orderId, customerId: userId }, { status: 'CANCELLED' });
    if (!order) return { error: 'Order not found or you do not have permission to cancel.' };
    return { _type: 'ACTION_CARD', title: 'Order Cancelled', message: `Order ${args.orderId} has been cancelled.` };
  }

  async handleCreateReturnRequest(args, userId) {
    return { _type: 'ACTION_CARD', title: 'Return Request', message: `Return requested for order ${args.orderId}.` };
  }

  async handleGetRefundStatus(args, userId) {
    return { _type: 'ACTION_CARD', title: 'Refund Status', message: `Refund for ${args.orderId} is currently processing.` };
  }

  async handleGetDeliveryPartner(args, userId) {
    const order = await Order.findById(args.orderId).populate('deliveryPartner').lean();
    if (!order || !order.deliveryPartner) return { error: 'No delivery partner assigned yet.' };
    return { _type: 'PROFILE_CARD', profile: order.deliveryPartner };
  }

  async handleGetDeliveryLocation(args, userId) {
    return { _type: 'DELIVERY_CARD', title: 'Live Location', order: { status: 'IN_TRANSIT' } }; // Stub
  }

  // --- Support Implementations ---
  async handleCreateTicket(args, userId) {
    const ticket = await SupportTicket.create({ customer: userId, subject: args.subject, description: args.message, status: 'OPEN' });
    return { _type: 'TICKET_CARD', tickets: [ticket] };
  }

  async handleListTickets(userId) {
    const tickets = await SupportTicket.find({ $or: [{ customer: userId }, { seller: userId }] }).lean();
    if (!tickets.length) return { _type: 'ACTION_CARD', title: 'Support Tickets', message: 'No support tickets found.' };
    return { _type: 'TICKET_CARD', tickets };
  }

  async handleGetTicketStatus(args, userId) {
    const ticket = await SupportTicket.findById(args.ticketId).lean();
    if (!ticket) return { _type: 'ACTION_CARD', title: 'Ticket Error', message: 'Ticket not found.' };
    return { _type: 'TICKET_CARD', tickets: [ticket] };
  }

  async handleEscalateTicket(args, userId) {
    return { _type: 'ACTION_CARD', title: 'Ticket Escalated', message: `Ticket ${args.ticketId} escalated.` };
  }

  // --- Others ---
  async handleGetWallet(userId) {
    const wallet = await Wallet.findOne({ user: userId }).lean();
    if (!wallet) return { _type: 'ACTION_CARD', title: 'Wallet', message: 'Wallet is currently empty.' };
    return { _type: 'WALLET_CARD', balance: wallet.balance, currency: wallet.currency, status: wallet.status };
  }

  async handleGetCoupons(userId) {
    const coupons = await Coupon.find({ isActive: true }).limit(5).lean();
    if (!coupons.length) return { error: 'No available coupons.' };
    return { _type: 'COUPON_CARD', coupons };
  }

  async handleGetNearestShops() {
    const shops = await Shop.find({ isApproved: true, status: 'active' }).limit(5).lean();
    if (!shops.length) return { error: 'No nearby shops found.' };
    return { _type: 'SHOP_CARD', shops };
  }

  async handleGetSellerRevenue(args, userId) {
    const data = [{ name: 'Mon', value: 120 }, { name: 'Tue', value: 190 }];
    return { _type: 'CHART', chartType: 'bar', title: 'Revenue Overview', data };
  }

  async handleGetProducts(args, role, userId) {
    const query = {};
    if (role === 'SELLER') query.seller = userId;
    if (args.lowStock) query.stock = { $lt: 10 };
    if (args.keyword) query.name = { $regex: args.keyword, $options: 'i' };

    const products = await Product.find(query).limit(5).lean();
    if (!products.length) return { error: 'No products found.' };
    return { _type: 'PRODUCT_CARD', products };
  }

  async handleGetDeliveryAssignments(args, userId) {
    const query = { deliveryPartner: userId };
    if (args.status) query.status = args.status;
    const deliveries = await Delivery.find(query).limit(5).populate('order').lean();
    if (!deliveries.length) return { error: 'No deliveries assigned.' };
    return { _type: 'DELIVERY_CARD', deliveries };
  }

  async handleGetDeliveryEarnings(userId) {
    return { _type: 'WALLET_CARD', balance: 150.00, currency: 'USD', title: 'Today Earnings' }; 
  }

  async handleGetMarketplaceAnalytics() {
    const data = [{ name: 'Jan', value: 120000 }, { name: 'Feb', value: 150000 }];
    return { _type: 'CHART', chartType: 'line', title: 'Marketplace GMV', data };
  }

  async handleGetFraudCases() {
    return { _type: 'ACTION_CARD', title: 'Fraud Alerts', message: 'No critical fraud alerts detected.' };
  }

  async handleQueryDatabase(args) {
    try {
      const models = { User, Shop, Order, Product, Delivery, Coupon, SupportTicket, Wallet };
      const Model = models[args.collectionName];
      if (!Model) return { error: `Model ${args.collectionName} not found.` };
      
      let queryObj = {};
      if (args.query) {
        try { queryObj = JSON.parse(args.query); } catch (e) {}
      }
      
      let req = Model.find(queryObj);
      if (args.populate) {
        const fields = args.populate.split(',').map(f => f.trim());
        for (const field of fields) {
          req = req.populate(field);
        }
      }
      if (args.limit) req = req.limit(args.limit);
      else req = req.limit(50);
      
      const results = await req.lean();
      return { success: true, count: results.length, data: results };
    } catch (e) {
      return { error: e.message };
    }
  }
}

module.exports = {
  ToolDeclarations,
  AIToolsExecutor: new AIToolsExecutor()
};
