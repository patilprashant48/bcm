const bcrypt = require('bcryptjs');

// Generate hash for 'business123'
bcrypt.hash('business123', 10, (err, hash) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('\n===========================================');
    console.log('PASSWORD HASH GENERATED');
    console.log('===========================================\n');
    console.log('Password: business123');
    console.log('Hash:', hash);
    console.log('\n===========================================');
    console.log('COPY THIS ENTIRE DOCUMENT TO MONGODB COMPASS');
    console.log('===========================================\n');

    const document = {
        email: 'business@test.com',
        passwordHash: hash,
        mobile: '9876543210',
        role: 'BUSINESS_USER',
        isActive: true,
        passwordUpdated: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    console.log(JSON.stringify(document, null, 2));

    console.log('\n===========================================');
    console.log('STEPS:');
    console.log('===========================================');
    console.log('1. Open MongoDB Compass');
    console.log('2. Connect to your cluster');
    console.log('3. Go to database: bcm');
    console.log('4. Go to collection: users');
    console.log('5. Click "ADD DATA" → "Insert Document"');
    console.log('6. Paste the JSON above');
    console.log('7. Click "Insert"');
    console.log('8. Try logging in!');
    console.log('===========================================\n');
});
