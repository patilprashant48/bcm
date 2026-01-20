const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Hash password
        const passwordHash = await bcrypt.hash('business123', 10);

        // Create business user directly
        const result = await db.collection('users').insertOne({
            email: 'business@test.com',
            passwordHash: passwordHash,
            mobile: '9876543210',
            role: 'BUSINESS_USER',
            isActive: true,
            passwordUpdated: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('✅ Business user created:', result.insertedId);
        console.log('\nLogin with:');
        console.log('Email: business@test.com');
        console.log('Password: business123');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestUser();
