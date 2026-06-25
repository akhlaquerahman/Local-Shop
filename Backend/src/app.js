const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
const registerRoutes = (prefix) => {
  app.use(`${prefix}/auth`, require('./modules/auth'));
  app.use(`${prefix}/users`, require('./modules/users'));
  app.use(`${prefix}/shops`, require('./modules/shops'));
  app.use(`${prefix}/products`, require('./modules/products'));
  app.use(`${prefix}/search`, require('./modules/search'));
  app.use(`${prefix}/categories`, require('./modules/categories'));
  app.use(`${prefix}/orders`, require('./modules/orders'));
  app.use(`${prefix}/deliveries`, require('./modules/deliveries'));
  app.use(`${prefix}/reviews`, require('./modules/reviews'));
  app.use(`${prefix}/returns`, require('./modules/returns/returns.routes'));
  app.use(`${prefix}/coupons`, require('./modules/coupons'));
  app.use(`${prefix}/wishlist`, require('./modules/wishlist'));
  app.use(`${prefix}/cart`, require('./modules/cart'));
  app.use(`${prefix}/addresses`, require('./modules/addresses'));
  app.use(`${prefix}/profile`, require('./modules/profile'));
  app.use(`${prefix}/wallet`, require('./modules/wallet'));
  app.use(`${prefix}/referrals`, require('./modules/referrals'));
  app.use(`${prefix}/payments`, require('./modules/payments'));
  app.use(`${prefix}/security`, require('./modules/security'));
  app.use(`${prefix}/activity`, require('./modules/activity'));
  app.use(`${prefix}/payouts`, require('./modules/payouts'));
  app.use(`${prefix}/notifications`, require('./modules/notifications'));
  app.use(`${prefix}/support`, require('./modules/support'));
  app.use(`${prefix}/disputes`, require('./modules/disputes'));
  app.use(`${prefix}/analytics`, require('./modules/analytics'));
  app.use(`${prefix}/cms`, require('./modules/cms'));
  app.use(`${prefix}/banners`, require('./modules/banners'));
  app.use(`${prefix}/roles`, require('./modules/roles'));
  app.use(`${prefix}/permissions`, require('./modules/permissions'));
  app.use(`${prefix}/fraud`, require('./modules/fraud'));
  app.use(`${prefix}/reports`, require('./modules/reports'));
  app.use(`${prefix}/settings`, require('./modules/settings'));
  app.use(`${prefix}/seller`, require('./modules/seller/seller.routes'));
  app.use(`${prefix}/rider`, require('./modules/rider/rider.routes'));
  app.use(`${prefix}/admin/database`, require('./modules/database-explorer/database-explorer.routes'));
  app.use(`${prefix}/admin/configuration`, require('./modules/configuration/configuration.routes'));
  app.use(`${prefix}/admin/kyc`, require('./modules/admin/admin.kyc.routes'));
  app.use(`${prefix}/admin`, require('./modules/admin/admin.routes'));
  app.use(`${prefix}/ai`, require('./modules/ai/ai.routes'));
  app.use(`${prefix}/kyc`, require('./modules/kyc/kyc.routes'));
};

app.get('/api/dump-routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) { // routes registered directly on the app
      routes.push(middleware.route.path);
    } else if (middleware.name === 'router') { // router middleware 
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = middleware.regexp.toString();
          routes.push(path + ' -> ' + handler.route.path);
        }
      });
    }
  });
  require('fs').writeFileSync('C:\\Users\\akhla\\Desktop\\Local Shop\\Backend\\routes-dump.txt', routes.join('\n'));
  res.json({ count: routes.length, routes });
});


registerRoutes('/api');
registerRoutes('/api/v1');

app.use(require('./middleware/notFound'));
app.use(require('./middleware/errorHandler'));

module.exports = app;

setTimeout(() => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) { 
      routes.push(middleware.route.path);
    } else if (middleware.name === 'router') { 
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = middleware.regexp.toString();
          routes.push(path + ' -> ' + handler.route.path);
        }
      });
    }
  });
  require('fs').writeFileSync('C:\\Users\\akhla\\Desktop\\Local Shop\\Backend\\routes-dump-startup.txt', routes.join('\n'));
}, 2000);
