const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    business_name: {
        type: String,
        required: true
    },
    business_type: {
        type: String,
        enum: ['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED', 'PUBLIC_LIMITED', 'LLP'],
        required: true
    },
    registration_number: String,
    pan: String,
    gst: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    contact_person: String,
    contact_mobile: String,
    contact_email: String,
    bank_name: String,
    account_number: String,
    ifsc_code: String,
    account_holder_name: String,
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    activation_status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'RECHECK'],
        default: 'PENDING'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Business', businessSchema);
