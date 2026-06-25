const http = require('http');

const data = JSON.stringify({
  fullName: 'Test Staff',
  email: 'teststaff' + Date.now() + '@example.com',
  phone: '1234567890' + Date.now().toString().slice(-4),
  password: 'password123',
  age: 25,
  gender: 'Male',
  dateOfJoining: '2023-01-01',
  role: 'STORE_MANAGER',
  permissions: ['*'],
  status: 'ACTIVE'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/seller/staff',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    // We need a valid token. Oh wait, I don't have a token.
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => { console.log(res.statusCode, body); });
});
req.write(data);
req.end();
