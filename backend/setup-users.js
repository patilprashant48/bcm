require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;
        const users = db.collection('users');

        // Clear existing users
        await users.deleteMany({});
        console.log('✓ Cleared existing users');

        // Hash passwords
        const adminHash = await bcrypt.hash('admin123', 10);
        const businessHash = await bcrypt.hash('business123', 10);
        const investorHash = await bcrypt.hash('investor123', 10);

        // Create users
        const result = await users.insertMany([
            {
                email: 'admin@bcm.com',
                passwordHash: adminHash,
                mobile: '9999999999',
                role: 'ADMIN',
                isActive: true,
                passwordUpdated: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                email: 'business@test.com',
                passwordHash: businessHash,
                mobile: '9876543210',
                role: 'BUSINESS_USER',
                isActive: true,
                passwordUpdated: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                email: 'investor@test.com',
                passwordHash: investorHash,
                mobile: '9123456789',
                role: 'INVESTOR',
                isActive: true,
                passwordUpdated: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        console.log('✓ Created', result.insertedCount, 'users');
        console.log('\n✅ Setup complete!\n');
        console.log('Login Credentials:');
        console.log('==================');
        console.log('Admin:    admin@bcm.com / admin123');
        console.log('Business: business@test.com / business123');
        console.log('Investor: investor@test.com / investor123');
        console.log('==================\n');
        console.log('Admin Web:    http://localhost:5173');
        console.log('Business Web: http://localhost:3001');
        console.log('==================\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createUsers();
