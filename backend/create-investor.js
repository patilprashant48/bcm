const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const User = require('./models/User');

async function createInvestorUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if investor user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: 'investor@test.com' },
                { mobile: '9876543210' }
            ]
        });

        if (existingUser) {
            console.log('ℹ️  Investor user already exists:');
            console.log('   Email:', existingUser.email);
            console.log('   Mobile:', existingUser.mobile);
            console.log('   User Type:', existingUser.user_type);

            // Update password if needed
            const passwordHash = await bcrypt.hash('investor123', 10);
            existingUser.password = passwordHash;
            existingUser.requires_password_update = false;
            existingUser.status = 'ACTIVE';
            await existingUser.save();
            console.log('✅ Password updated to: investor123');
        } else {
            // Create new investor user
            const passwordHash = await bcrypt.hash('investor123', 10);

            const newUser = new User({
                email: 'investor@test.com',
                mobile: '9876543210',
                password: passwordHash,
                name: 'Test Investor',
                user_type: 'INVESTOR',
                status: 'ACTIVE',
                requires_password_update: false
            });

            await newUser.save();
            console.log('✅ Created new investor user:');
            console.log('   Name: Test Investor');
            console.log('   Email: investor@test.com');
            console.log('   Mobile: 9876543210');
            console.log('   Password: investor123');
        }

        console.log('\n📱 Mobile App Login Credentials:');
        console.log('   Mobile: 9876543210');
        console.log('   Password: investor123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createInvestorUser();
