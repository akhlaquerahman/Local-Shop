const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/seller/staff/roles',
  method: 'GET',
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', error => console.error(error));
req.end();
