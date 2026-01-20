require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function updateUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;
        const users = db.collection('users');

        // Generate fresh hash
        const hash = await bcrypt.hash('business123', 10);
        console.log('✓ Generated password hash');

        // Update the user
        const result = await users.updateOne(
            { email: 'business@test.com' },
            {
                $set: {
                    passwordHash: hash,
                    isActive: true,
                    passwordUpdated: true
                }
            }
        );

        if (result.matchedCount === 0) {
            console.log('❌ User not found!');
            console.log('\nCreating new user...');

            await users.insertOne({
                email: 'business@test.com',
                passwordHash: hash,
                mobile: '9876543210',
                role: 'BUSINESS_USER',
                isActive: true,
                passwordUpdated: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log('✓ User created');
        } else {
            console.log('✓ User updated');
        }

        console.log('\n✅ Done! Try logging in now:');
        console.log('==================');
        console.log('URL: http://localhost:3001');
        console.log('Email: business@test.com');
        console.log('Password: business123');
        console.log('==================\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

updateUser();
