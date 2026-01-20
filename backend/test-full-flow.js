const http = require('http');

// First, login to get a token
const loginData = JSON.stringify({
    mobile: '9876543210',
    password: 'investor123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

console.log('Step 1: Testing login...\n');

const loginReq = http.request(loginOptions, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const loginResponse = JSON.parse(responseData);
            console.log('✅ Login successful!');
            console.log('Token:', loginResponse.token.substring(0, 50) + '...');

            // Now test getProfile with the token
            console.log('\nStep 2: Testing getProfile...\n');

            const profileOptions = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/auth/profile',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${loginResponse.token}`
                }
            };

            const profileReq = http.request(profileOptions, (profileRes) => {
                let profileData = '';

                profileRes.on('data', (chunk) => {
                    profileData += chunk;
                });

                profileRes.on('end', () => {
                    console.log('Profile Status Code:', profileRes.statusCode);
                    console.log('Profile Response:', profileData);

                    if (profileRes.statusCode === 200) {
                        console.log('\n✅ GetProfile successful!');
                    } else {
                        console.log('\n❌ GetProfile failed');
                    }
                });
            });

            profileReq.on('error', (error) => {
                console.error('❌ Profile Error:', error.message);
            });

            profileReq.end();
        } else {
            console.log('❌ Login failed');
            console.log('Response:', responseData);
        }
    });
});

loginReq.on('error', (error) => {
    console.error('❌ Login Error:', error.message);
});

loginReq.write(loginData);
loginReq.end();
