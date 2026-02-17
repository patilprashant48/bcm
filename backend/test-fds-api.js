require('dotenv').config();
const axios = require('axios');

async function testFDSEndpoint() {
    try {
        const baseUrl = process.env.API_URL || 'https://bcm-6f7f.onrender.com';
        const url = `${baseUrl}/api/investor/fds`;

        console.log(`Testing endpoint: ${url}\n`);

        const response = await axios.get(url);

        console.log('✓ API Response Status:', response.status);
        console.log('\n=== FDS SCHEMES FROM API ===');
        console.log(`Total schemes: ${response.data.schemes?.length || 0}\n`);

        if (response.data.schemes && response.data.schemes.length > 0) {
            response.data.schemes.forEach((scheme, index) => {
                console.log(`${index + 1}. ${scheme.name}`);
                console.log(`   Scheme ID: ${scheme.schemeId}`);
                console.log(`   Interest: ${scheme.interestPercent}%`);
                console.log(`   Min Amount: ₹${scheme.minAmount}`);
                console.log(`   Maturity: ${scheme.maturityDays} days`);
                console.log('');
            });
        } else {
            console.log('⚠️  No schemes returned from API');
        }

    } catch (error) {
        console.error('❌ Error testing API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testFDSEndpoint();
