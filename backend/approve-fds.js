require('dotenv').config();
const mongoose = require('mongoose');
const models = require('./database/mongodb-schema');

async function approveFDSchemes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Find all pending schemes
        const pendingSchemes = await models.FDScheme.find({
            approvalStatus: { $ne: 'APPROVED' }
        });

        console.log(`\nFound ${pendingSchemes.length} scheme(s) that need approval\n`);

        if (pendingSchemes.length === 0) {
            console.log('All schemes are already approved!');
        } else {
            for (const scheme of pendingSchemes) {
                console.log(`Approving: ${scheme.name} (${scheme.schemeId})`);

                scheme.approvalStatus = 'APPROVED';
                scheme.isActive = true;
                scheme.isPublished = true;

                await scheme.save();
                console.log(`✓ Approved and published: ${scheme.name}`);
            }

            console.log(`\n✓ Successfully approved ${pendingSchemes.length} scheme(s)`);
        }

        // Verify
        const visibleSchemes = await models.FDScheme.find({
            isActive: true,
            isPublished: true,
            approvalStatus: 'APPROVED'
        });

        console.log(`\n=== SCHEMES NOW VISIBLE TO INVESTORS ===`);
        console.log(`Count: ${visibleSchemes.length}\n`);

        visibleSchemes.forEach((scheme, index) => {
            console.log(`${index + 1}. ${scheme.name}`);
            console.log(`   Interest: ${scheme.interestPercent}% | Min: ₹${scheme.minAmount}`);
            console.log(`   Maturity: ${scheme.maturityDays} days`);
        });

        await mongoose.disconnect();
        console.log('\n✓ Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

approveFDSchemes();
