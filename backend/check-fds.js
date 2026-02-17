require('dotenv').config();
const mongoose = require('mongoose');
const models = require('./database/mongodb-schema');

async function checkFDSchemes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Get all FD Schemes
        const allSchemes = await models.FDScheme.find({});
        console.log('\n=== ALL FD SCHEMES ===');
        console.log(`Total schemes: ${allSchemes.length}\n`);

        allSchemes.forEach((scheme, index) => {
            console.log(`${index + 1}. ${scheme.name}`);
            console.log(`   ID: ${scheme._id}`);
            console.log(`   Scheme ID: ${scheme.schemeId}`);
            console.log(`   Interest: ${scheme.interestPercent}%`);
            console.log(`   Min Amount: ₹${scheme.minAmount}`);
            console.log(`   isActive: ${scheme.isActive}`);
            console.log(`   isPublished: ${scheme.isPublished}`);
            console.log(`   approvalStatus: ${scheme.approvalStatus}`);
            console.log(`   Created: ${scheme.createdAt}`);
            console.log('');
        });

        // Get schemes that should be visible to investors
        const visibleSchemes = await models.FDScheme.find({
            isActive: true,
            isPublished: true,
            approvalStatus: 'APPROVED'
        });

        console.log('\n=== SCHEMES VISIBLE TO INVESTORS ===');
        console.log(`Count: ${visibleSchemes.length}\n`);

        if (visibleSchemes.length === 0) {
            console.log('⚠️  NO SCHEMES ARE VISIBLE TO INVESTORS!');
            console.log('\nTo make a scheme visible, it must have:');
            console.log('  - isActive: true');
            console.log('  - isPublished: true');
            console.log('  - approvalStatus: "APPROVED"');
            console.log('\nPlease check the Admin Panel to:');
            console.log('  1. Approve the scheme (Status Management)');
            console.log('  2. Publish the scheme (toggle isPublished)');
            console.log('  3. Ensure it\'s active (toggle isActive)');
        } else {
            visibleSchemes.forEach((scheme, index) => {
                console.log(`${index + 1}. ${scheme.name} (${scheme.schemeId})`);
                console.log(`   Interest: ${scheme.interestPercent}% | Min: ₹${scheme.minAmount}`);
            });
        }

        await mongoose.disconnect();
        console.log('\n✓ Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkFDSchemes();
