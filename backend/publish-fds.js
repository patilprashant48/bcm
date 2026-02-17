require('dotenv').config();
const mongoose = require('mongoose');
const models = require('./database/mongodb-schema');

async function publishFDSchemes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Find all schemes that are approved but not published
        const unpublishedSchemes = await models.FDScheme.find({
            approvalStatus: 'APPROVED',
            $or: [
                { isPublished: false },
                { isPublished: { $exists: false } }
            ]
        });

        console.log(`\nFound ${unpublishedSchemes.length} approved scheme(s) that are not published\n`);

        if (unpublishedSchemes.length === 0) {
            console.log('All approved schemes are already published!');
        } else {
            for (const scheme of unpublishedSchemes) {
                console.log(`Publishing: ${scheme.name} (${scheme.schemeId})`);

                scheme.isPublished = true;
                scheme.isActive = true;

                await scheme.save();
                console.log(`✓ Published: ${scheme.name}`);
            }

            console.log(`\n✓ Successfully published ${unpublishedSchemes.length} scheme(s)`);
        }

        // Verify - show all visible schemes
        const visibleSchemes = await models.FDScheme.find({
            isActive: true,
            isPublished: true,
            approvalStatus: 'APPROVED'
        });

        console.log(`\n=== SCHEMES NOW VISIBLE TO INVESTORS ===`);
        console.log(`Count: ${visibleSchemes.length}\n`);

        visibleSchemes.forEach((scheme, index) => {
            console.log(`${index + 1}. ${scheme.name}`);
            console.log(`   Scheme ID: ${scheme.schemeId}`);
            console.log(`   Interest: ${scheme.interestPercent}% | Min: ₹${scheme.minAmount}`);
            console.log(`   Maturity: ${scheme.maturityDays} days`);
            console.log('');
        });

        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

publishFDSchemes();
