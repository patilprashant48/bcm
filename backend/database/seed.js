const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Business = require('../models/Business');
const Plan = require('../models/Plan');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Business.deleteMany({});
        await Plan.deleteMany({});
        console.log('✓ Database cleared');

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const businessPassword = await bcrypt.hash('business123', 10);
        const investorPassword = await bcrypt.hash('investor123', 10);

        // Create Admin User
        const admin = await User.create({
            email: 'admin@bcm.com',
            password: hashedPassword,
            user_type: 'ADMIN',
            name: 'Admin User',
            mobile: '9999999999',
            status: 'ACTIVE'
        });
        console.log('✓ Admin user created:', admin.email);

        // Create Business User
        const businessUser = await User.create({
            email: 'business@test.com',
            password: businessPassword,
            user_type: 'BUSINESS',
            name: 'Test Business',
            mobile: '9876543210',
            status: 'ACTIVE'
        });
        console.log('✓ Business user created:', businessUser.email);

        // Create Business Profile
        const business = await Business.create({
            user_id: businessUser._id,
            business_name: 'Test Business Pvt Ltd',
            business_type: 'PRIVATE_LIMITED',
            registration_number: 'U12345MH2020PTC123456',
            pan: 'ABCDE1234F',
            gst: '27ABCDE1234F1Z5',
            address: '123 Business Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            contact_person: 'John Doe',
            contact_mobile: '9876543210',
            contact_email: 'business@test.com',
            bank_name: 'HDFC Bank',
            account_number: '12345678901234',
            ifsc_code: 'HDFC0001234',
            account_holder_name: 'Test Business Pvt Ltd',
            status: 'ACTIVE',
            activation_status: 'APPROVED'
        });
        console.log('✓ Business profile created');

        // Create Investor User
        const investor = await User.create({
            email: 'investor@test.com',
            password: investorPassword,
            user_type: 'INVESTOR',
            name: 'Test Investor',
            mobile: '9123456789',
            status: 'ACTIVE'
        });
        console.log('✓ Investor user created:', investor.email);

        // Create Plans
        const plans = await Plan.insertMany([
            {
                plan_name: 'Basic',
                description: 'Perfect for startups',
                price: 0,
                duration_months: 1,
                max_projects: 1,
                max_capital_per_project: 500000,
                commission_rate: 5.0,
                features: ['1 Project', 'Basic Support', 'Email Notifications'],
                is_active: true
            },
            {
                plan_name: 'Professional',
                description: 'For growing businesses',
                price: 2999,
                duration_months: 3,
                max_projects: 5,
                max_capital_per_project: 5000000,
                commission_rate: 3.5,
                features: ['5 Projects', 'Priority Support', 'Advanced Analytics', 'Custom Branding'],
                is_active: true
            },
            {
                plan_name: 'Enterprise',
                description: 'For established companies',
                price: 9999,
                duration_months: 12,
                max_projects: -1,
                max_capital_per_project: -1,
                commission_rate: 2.0,
                features: ['Unlimited Projects', '24/7 Support', 'Advanced Analytics', 'Custom Branding', 'Dedicated Manager'],
                is_active: true
            }
        ]);
        console.log('✓ Plans created:', plans.length);

        console.log('\n✅ Seed completed successfully!\n');
        console.log('Login Credentials:');
        console.log('==================');
        console.log('Admin:    admin@bcm.com / admin123');
        console.log('Business: business@test.com / business123');
        console.log('Investor: investor@test.com / investor123');
        console.log('==================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seedDatabase();
