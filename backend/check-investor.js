const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkInvestor() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find investor user
        const user = await User.findOne({
            $or: [
                { email: 'investor@test.com' },
                { mobile: '9876543210' }
            ]
        });

        if (user) {
            console.log('✅ Investor user found in database:');
            console.log('   ID:', user._id);
            console.log('   Name:', user.name);
            console.log('   Email:', user.email);
            console.log('   Mobile:', user.mobile);
            console.log('   User Type:', user.user_type);
            console.log('   Status:', user.status);
            console.log('   Has Password:', !!user.password);

            // Test password
            if (user.password) {
                const isValid = await bcrypt.compare('investor123', user.password);
                console.log('   Password Test:', isValid ? '✅ VALID' : '❌ INVALID');
            }
        } else {
            console.log('❌ Investor user NOT found in database');
            console.log('\nCreating investor user now...\n');

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
            console.log('✅ Investor user created successfully!');
        }

        console.log('\n📱 Login Credentials:');
        console.log('   Mobile: 9876543210');
        console.log('   Password: investor123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

checkInvestor();
