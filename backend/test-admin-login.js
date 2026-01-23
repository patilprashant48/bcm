const https = require('https');

const data = JSON.stringify({
    email: 'admin@bcm.com',
    password: 'Admin@123'
});

const options = {
    hostname: 'bcm-6f7f.onrender.com',
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing admin login...');
console.log('URL: https://bcm-6f7f.onrender.com/api/auth/login');
console.log('Email: admin@bcm.com');
console.log('Password: Admin@123\n');

const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('\nResponse:');

        try {
            const json = JSON.parse(responseData);
            console.log(JSON.stringify(json, null, 2));

            if (json.success) {
                console.log('\n✅ Login successful!');
                console.log('Token:', json.token?.substring(0, 50) + '...');
                console.log('User:', json.user);
            } else {
                console.log('\n❌ Login failed:', json.message);
            }
        } catch (e) {
            console.log('Raw response:', responseData);
            console.log('Parse error:', e.message);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
});

req.write(data);
req.end();
