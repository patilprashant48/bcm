const mongoose = require('mongoose');
const models = require('../database/mongodb-schema');

/**
 * Seed data for MongoDB
 * Creates default admin account and platform settings
 */

async function seedDatabase() {
    try {
        console.log('Starting database seeding...');

        // Check if admin already exists
        const existingAdmin = await models.User.findOne({ email: 'admin@bcm.com' });

        if (existingAdmin) {
            console.log('Admin user already exists. Skipping seed.');
            return;
        }

        // Create admin user
        const bcrypt = require('bcryptjs');
        const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

        const adminUser = await models.User.create({
            email: 'admin@bcm.com',
            mobile: '9999999999',
            role: 'ADMIN',
            passwordHash: adminPasswordHash,
            passwordUpdated: true,
            isActive: true
        });

        console.log('✓ Admin user created');

        // Create admin profile
        await models.UserProfile.create({
            userId: adminUser._id,
            fullName: 'Platform Administrator'
        });

        console.log('✓ Admin profile created');

        // Create admin wallet
        await models.Wallet.create({
            userId: adminUser._id,
            walletType: 'ADMIN'
        });

        console.log('✓ Admin wallet created');

        // Insert platform settings
        const settings = [
            { settingKey: 'commission_percentage', settingValue: '2', description: 'Platform commission on share transactions (%)' },
            { settingKey: 'company_bank_name', settingValue: 'HDFC Bank', description: 'Company bank name for payments' },
            { settingKey: 'company_account_number', settingValue: '1234567890', description: 'Company bank account number' },
            { settingKey: 'company_ifsc', settingValue: 'HDFC0001234', description: 'Company bank IFSC code' },
            { settingKey: 'company_upi_id', settingValue: 'bcm@hdfc', description: 'Company UPI ID' },
            { settingKey: 'company_qr_code_url', settingValue: '', description: 'Company UPI QR code URL' },
            { settingKey: 'smtp_host', settingValue: 'smtp.gmail.com', description: 'SMTP server host' },
            { settingKey: 'smtp_port', settingValue: '587', description: 'SMTP server port' },
            { settingKey: 'smtp_user', settingValue: '', description: 'SMTP username' },
            { settingKey: 'smtp_password', settingValue: '', description: 'SMTP password' },
            { settingKey: 'platform_name', settingValue: 'Business Capital Market', description: 'Platform display name' },
            { settingKey: 'support_email', settingValue: 'support@bcm.com', description: 'Support email address' },
            { settingKey: 'support_mobile', settingValue: '1800-123-4567', description: 'Support mobile number' }
        ];

        await models.PlatformSetting.insertMany(settings);
        console.log('✓ Platform settings created');

        // Insert sample plans
        const plans = [
            {
                name: 'Basic Plan',
                description: 'Perfect for startups and small businesses',
                price: 999.00,
                durationDays: 30,
                features: {
                    max_projects: 1,
                    max_capital_options: 2,
                    support: 'Email',
                    features: ['Basic Analytics', 'Email Support', '1 Project', '2 Capital Options']
                },
                isActive: true
            },
            {
                name: 'Professional Plan',
                description: 'Ideal for growing businesses',
                price: 2999.00,
                durationDays: 90,
                features: {
                    max_projects: 5,
                    max_capital_options: 10,
                    support: 'Priority Email',
                    features: ['Advanced Analytics', 'Priority Support', '5 Projects', '10 Capital Options', 'Custom Branding']
                },
                isActive: true
            },
            {
                name: 'Enterprise Plan',
                description: 'For established businesses with multiple projects',
                price: 9999.00,
                durationDays: 365,
                features: {
                    max_projects: -1,
                    max_capital_options: -1,
                    support: '24/7 Phone & Email',
                    features: ['Premium Analytics', '24/7 Support', 'Unlimited Projects', 'Unlimited Capital Options', 'Custom Branding', 'Dedicated Account Manager']
                },
                isActive: true
            }
        ];

        await models.Plan.insertMany(plans);
        console.log('✓ Sample plans created');

        // Insert document templates
        const templates = [
            {
                templateName: 'Business Activation Agreement',
                templateContent: '<html><body><h1>Business Activation Agreement</h1><p>This agreement is made on {{activation_date}} between Business Capital Market and {{business_name}}.</p><p><strong>Business Details:</strong></p><ul><li>Business Name: {{business_name}}</li><li>Owner Name: {{user_name}}</li><li>Email: {{email}}</li><li>Mobile: {{mobile}}</li><li>Business ID: {{business_id}}</li></ul><p><strong>Terms and Conditions:</strong></p><ol><li>The business agrees to comply with all platform policies.</li><li>All transactions will be subject to platform commission.</li><li>The business is responsible for accurate information.</li><li>The platform reserves the right to suspend or terminate access.</li></ol><p>Activated on: {{activation_date}}</p></body></html>',
                documentType: 'ACTIVATION_AGREEMENT',
                isActive: true
            },
            {
                templateName: 'Plan Subscription Agreement',
                templateContent: '<html><body><h1>Plan Subscription Agreement</h1><p>This subscription agreement is made on {{activation_date}}.</p><p><strong>Subscriber Details:</strong></p><ul><li>Name: {{user_name}}</li><li>Business: {{business_name}}</li><li>Email: {{email}}</li><li>Mobile: {{mobile}}</li></ul><p><strong>Plan Details:</strong></p><ul><li>Plan Name: {{plan_name}}</li><li>Plan Price: ₹{{plan_price}}</li><li>Duration: {{plan_duration}} days</li><li>Activation Date: {{activation_date}}</li><li>Expiry Date: {{expiry_date}}</li></ul><p><strong>Features Included:</strong></p><p>{{plan_features}}</p></body></html>',
                documentType: 'PLAN_SUBSCRIPTION',
                isActive: true
            }
        ];

        await models.DocumentTemplate.insertMany(templates);
        console.log('✓ Document templates created');

        // Insert sample announcement
        await models.Announcement.create({
            title: 'Welcome to BCM Platform',
            message: 'Welcome to Business Capital Market! Start your investment journey today.',
            priority: 'HIGH',
            targetAudience: 'INVESTOR',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true
        });

        console.log('✓ Sample announcement created');

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\nDefault Admin Credentials:');
        console.log('Email: admin@bcm.com');
        console.log('Password: Admin@123');

    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

module.exports = seedDatabase;
