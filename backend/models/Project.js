const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    business_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project_name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    project_type: {
        type: String,
        enum: ['BUSINESS_EXPANSION', 'NEW_VENTURE', 'PRODUCT_LAUNCH', 'INFRASTRUCTURE', 'TECHNOLOGY', 'OTHER'],
        required: true
    },
    required_capital: {
        type: Number,
        required: true,
        min: 0
    },
    raised_capital: {
        type: Number,
        default: 0,
        min: 0
    },
    expected_roi: {
        type: Number,
        required: true,
        min: 0
    },
    duration_months: {
        type: Number,
        required: true,
        min: 1
    },
    location: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    business_plan: {
        type: String,
        required: true
    },
    risk_factors: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING_APPROVAL'
    },
    admin_notes: {
        type: String,
        default: ''
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approved_at: {
        type: Date
    },
    rejected_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for faster queries
projectSchema.index({ business_id: 1, status: 1 });
projectSchema.index({ status: 1, created_at: -1 });

// Check if model exists before creating to avoid OverwriteModelError
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

module.exports = Project;

