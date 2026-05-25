const http = require('http');

const data = JSON.stringify({ videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate-quiz',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
