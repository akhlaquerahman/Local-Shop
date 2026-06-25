const errorHandler = (err, req, res, next) => {
  require('fs').appendFileSync('C:\\Users\\akhla\\Desktop\\Local Shop\\Backend\\global-error.txt', new Date().toISOString() + ' ' + req.method + ' ' + req.url + ' ' + err.stack + '\n');
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
};

module.exports = errorHandler;
