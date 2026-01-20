const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    plan_name: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true,
        default: 0
    },
    duration_months: {
        type: Number,
        required: true
    },
    max_projects: {
        type: Number,
        default: -1  // -1 means unlimited
    },
    max_capital_per_project: {
        type: Number,
        default: -1  // -1 means unlimited
    },
    commission_rate: {
        type: Number,
        required: true
    },
    features: [{
        type: String
    }],
    is_active: {
        type: Boolean,
        default: true
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

module.exports = mongoose.model('Plan', planSchema);
