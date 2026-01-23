const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

const checkAdmin = async () => {
    await connectDB();

    try {
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            password: String, // or passwordHash depending on what your schema uses at runtime
            role: String,
            user_type: String
        }, { strict: false })); // Use strict false to see all fields

        const admin = await User.findOne({ email: 'admin@bcm.com' });

        if (!admin) {
            console.log('❌ Admin user NOT FOUND in database!');
        } else {
            console.log('✅ Admin user FOUND:');
            console.log(JSON.stringify(admin.toObject(), null, 2));

            // Test password
            const isMatch = await bcrypt.compare('Admin@123', admin.password);
            console.log(`🔑 Password 'Admin@123' match: ${isMatch ? 'YES' : 'NO'}`);

            if (!isMatch) {
                console.log('   (Password mismatch - creating new hash to compare)');
                const newHash = await bcrypt.hash('Admin@123', 10);
                console.log(`   New hash for Admin@123: ${newHash}`);
            }
        }

    } catch (error) {
        console.error('Error checking admin:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkAdmin();
