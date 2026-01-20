const http = require('http');

const data = JSON.stringify({
    mobile: '9876543210',
    password: 'investor123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing login endpoint...\n');

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', responseData);

        if (res.statusCode === 200) {
            console.log('\n✅ Login successful!');
            const parsed = JSON.parse(responseData);
            console.log('Token:', parsed.token ? 'Present' : 'Missing');
            console.log('User:', parsed.user ? 'Present' : 'Missing');
        } else {
            console.log('\n❌ Login failed');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
});

req.write(data);
req.end();
