require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createUsers() {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB');

        const db = client.db();
        const users = db.collection('users');

        // Clear existing users
        await users.deleteMany({});
        console.log('✓ Cleared existing users');

        // Hash passwords
        const adminHash = await bcrypt.hash('admin123', 10);
        const businessHash = await bcrypt.hash('business123', 10);
        const investorHash = await bcrypt.hash('investor123', 10);

        // Create users
        await users.insertMany([
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

        console.log('✓ Created 3 users');
        console.log('\n✅ Setup complete!\n');
        console.log('Login Credentials:');
        console.log('==================');
        console.log('Admin:    admin@bcm.com / admin123');
        console.log('Business: business@test.com / business123');
        console.log('Investor: investor@test.com / investor123');
        console.log('==================\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        process.exit(0);
    }
}

createUsers();
