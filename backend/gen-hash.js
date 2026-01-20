const bcrypt = require('bcryptjs');

const password = 'business123';
const hash = bcrypt.hashSync(password, 10);

console.log('\n===========================================');
console.log('PASSWORD HASH FOR MONGODB');
console.log('===========================================\n');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\n===========================================');
console.log('UPDATE THE USER IN MONGODB COMPASS');
console.log('===========================================\n');
console.log('1. Find the user with email: business@test.com');
console.log('2. Click Edit (pencil icon)');
console.log('3. Replace the passwordHash field with:');
console.log('\n' + hash + '\n');
console.log('4. Click Update');
console.log('5. Try logging in again');
console.log('===========================================\n');
