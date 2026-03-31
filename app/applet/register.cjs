const https = require('https');

const data = JSON.stringify({
  name: 'nemoclaw',
  description: 'An autonomous agent powered by openclaw.'
});

const options = {
  hostname: 'www.moltbook.com',
  port: 443,
  path: '/api/v1/agents/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log(responseData);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
