const bcrypt = require('bcryptjs');

console.log('\nGenerating password hash...\n');

const hash = bcrypt.hashSync('business123', 10);

console.log('===========================================');
console.log('PASSWORD HASH GENERATED');
console.log('===========================================\n');
console.log('Password: business123');
console.log('Hash:', hash);
console.log('\n===========================================');
console.log('COPY THIS JSON TO MONGODB COMPASS');
console.log('===========================================\n');

const document = {
    email: 'business@test.com',
    passwordHash: hash,
    mobile: '9876543210',
    role: 'BUSINESS_USER',
    isActive: true,
    passwordUpdated: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

console.log(JSON.stringify(document, null, 2));

console.log('\n===========================================');
console.log('STEPS TO INSERT USER:');
console.log('===========================================');
console.log('1. Open MongoDB Compass');
console.log('2. Connect to your Atlas cluster');
console.log('3. Select database: bcm');
console.log('4. Select collection: users (create if not exists)');
console.log('5. Click "ADD DATA" → "Insert Document"');
console.log('6. Paste the JSON above');
console.log('7. Click "Insert"');
console.log('8. Go to http://localhost:3001');
console.log('9. Login with:');
console.log('   Email: business@test.com');
console.log('   Password: business123');
console.log('===========================================\n');
