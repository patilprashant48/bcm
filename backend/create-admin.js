const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            $or: [
                { email: 'admin@bcm.com' },
                { mobile: '9999999999' }
            ]
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('   Email:', existingAdmin.email);
            console.log('   Mobile:', existingAdmin.mobile);
            console.log('\nUpdating password...\n');

            // Update password
            const passwordHash = await bcrypt.hash('Admin@123', 10);
            existingAdmin.password = passwordHash;
            existingAdmin.requires_password_update = false;
            await existingAdmin.save();

            console.log('✅ Admin password updated successfully!');
        } else {
            console.log('Creating new admin user...\n');

            const passwordHash = await bcrypt.hash('Admin@123', 10);
            const admin = new User({
                email: 'admin@bcm.com',
                mobile: '9999999999',
                password: passwordHash,
                name: 'BCM Administrator',
                user_type: 'ADMIN',
                status: 'ACTIVE',
                requires_password_update: false
            });

            await admin.save();
            console.log('✅ Admin user created successfully!');
        }

        console.log('\n📋 Admin Login Credentials:');
        console.log('   Email: admin@bcm.com');
        console.log('   Password: Admin@123');
        console.log('   Mobile: 9999999999');
        console.log('   Role: ADMIN');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

createAdmin();
