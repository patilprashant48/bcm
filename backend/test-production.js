const https = require('https');

console.log('Testing deployed backend at: https://bcm-6f7f.onrender.com\n');

// Test 1: Health check
console.log('Test 1: Health Check...');
https.get('https://bcm-6f7f.onrender.com/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('✅ Health check response:', data);
        console.log('Status:', res.statusCode);

        // Test 2: Login
        testLogin();
    });
}).on('error', (err) => {
    console.log('❌ Health check failed:', err.message);
    console.log('\n⚠️  Backend might be sleeping (Render free tier)');
    console.log('   Try accessing https://bcm-6f7f.onrender.com/health in your browser first');
    console.log('   Wait 30-60 seconds for it to wake up, then try again');
});

function testLogin() {
    console.log('\nTest 2: Login endpoint...');

    const postData = JSON.stringify({
        mobile: '9876543210',
        password: 'investor123'
    });

    const options = {
        hostname: 'bcm-6f7f.onrender.com',
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);

            if (res.statusCode === 200) {
                const parsed = JSON.parse(data);
                console.log('\n✅ Login successful!');
                console.log('Token present:', !!parsed.token);
                console.log('User present:', !!parsed.user);
            } else {
                console.log('\n❌ Login failed');
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Login request failed:', err.message);
    });

    req.write(postData);
    req.end();
}
