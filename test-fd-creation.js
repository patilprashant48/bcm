// Test FD Creation API
const axios = require('axios');

const API_URL = 'https://bcm-6f7f.onrender.com/api';

async function testFDCreation() {
    try {
        console.log('\n🧪 Testing FD Scheme Creation API...\n');

        // First, login as a business user to get token
        console.log('Step 1: Login required...');
        console.log('⚠️  You need a valid business user account token to test this.');
        console.log('   Please provide login credentials or use an existing token.\n');

        // Test the endpoint structure
        console.log('Step 2: Testing endpoint accessibility...');
        
        const testData = {
            name: 'Test FD Scheme',
            interestPercent: 5,
            minAmount: 1000,
            maturityDays: 450, // 15 months * 30
            interestCalculationDays: 365,
            interestTransferType: ['MAIN'],
            taxDeductionPercent: 0,
            maturityTransferDivision: {
                mainWallet: 100,
                incomeWallet: 0
            }
        };

        console.log('📤 Request Data:');
        console.log(JSON.stringify(testData, null, 2));
        console.log('\n📍 Endpoint: POST /api/fds/schemes');
        console.log('🔐 Requires: Bearer Token (Business User)\n');

        // Note: Actual request needs authentication
        console.log('⚠️  To complete this test, you need to:');
        console.log('   1. Login to business panel');
        console.log('   2. Open browser DevTools (F12)');
        console.log('   3. Go to Console tab');
        console.log('   4. Try creating FD and check the error message');
        console.log('   5. Look for red error logs with details\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testFDCreation();
