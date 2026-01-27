const https = require('https');

console.log('Checking URL...');
const req = https.get('https://bcm-6f7f.onrender.com/api', (res) => {
    console.log('Status:', res.statusCode);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.end();
