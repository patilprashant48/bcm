// Test login endpoint
const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login endpoint...\n');

        const response = await axios.post('http://localhost:5000/api/auth/login', {
            mobile: '9876543210',
            password: 'investor123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('❌ Login failed');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
    }
}

testLogin();
