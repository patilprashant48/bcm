require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing DB connection...');
const uri = process.env.MONGODB_URI;
console.log('URI:', uri.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('✅ Connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    });
