require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function debugLogin() {
    const logParams = [];
    const log = (msg) => {
        console.log(msg);
        logParams.push(msg);
    };

    try {
        log('Starting debug script...');
        log(`URI: ${process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')}`); // Hide password

        await mongoose.connect(process.env.MONGODB_URI);
        log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const users = db.collection('users');

        const email = 'business@test.com';
        const password = 'business123';

        const user = await users.findOne({ email });

        if (!user) {
            log('❌ User NOT found in database');
        } else {
            log('✓ User found in database');
            log(`Role: ${user.role}`);
            log(`DB Database Name: ${mongoose.connection.name}`);
            log(`Password Hash in DB: ${user.passwordHash}`);

            if (!user.passwordHash) {
                log('❌ No password hash found on user object');
            } else {
                const isMatch = await bcrypt.compare(password, user.passwordHash);
                if (isMatch) {
                    log('✅ Password "business123" MATCHES the hash in key "passwordHash"');
                } else {
                    log('❌ Password "business123" DOES NOT MATCH the hash');

                    // Generate what it should be
                    const newHash = await bcrypt.hash(password, 10);
                    log(`Generated valid hash: ${newHash}`);

                    // Fix it
                    await users.updateOne(
                        { email },
                        { $set: { passwordHash: newHash, isActive: true } }
                    );
                    log('✅ Updated user with new valid hash');
                }
            }
        }

    } catch (error) {
        log(`❌ Error: ${error.message}`);
    } finally {
        await mongoose.disconnect();
        fs.writeFileSync('debug_output.txt', logParams.join('\n'));
        process.exit(0);
    }
}

debugLogin();
