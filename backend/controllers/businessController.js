const models = require('../database/mongodb-schema');
const Business = models.Business || models.BusinessProfile;
const User = models.User;

/**
 * Submit business onboarding
 */
exports.submitOnboarding = async (req, res) => {
    try {
        const { businessData } = req.body;

        // Create or update business profile
        let business = await Business.findOne({ userId: req.user.id });

        if (business) {
            // Update existing
            Object.assign(business, businessData);
            business.approvalStatus = 'NEW'; // Force re-approval on update
        } else {
            // Create new
            business = new Business({
                userId: req.user.id,
                ...businessData,
                approvalStatus: 'NEW',
                status: 'ACTIVE'
            });
        }

        await business.save();

        res.json({
            success: true,
            message: 'Business profile submitted for approval',
            business: {
                id: business._id,
                status: business.approvalStatus
            }
        });
    } catch (error) {
        console.error('Submit onboarding error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit business profile',
            error: error.message
        });
    }
};

/**
 * Get business profile
 */
exports.getProfile = async (req, res) => {
    try {
        const business = await Business.findOne({ userId: req.user.id });

        if (!business) {
            return res.json({
                success: true,
                profile: null,
                message: 'No business profile found'
            });
        }

        res.json({
            success: true,
            profile: {
                id: business._id,
                business_name: business.businessName,
                business_type: business.businessType,
                registration_number: business.registrationNumber,
                pan: business.pan,
                gst: business.gst,
                address: business.address,
                city: business.city,
                state: business.state,
                pincode: business.pincode,
                contact_person: business.contactPerson,
                contact_mobile: business.contactMobile,
                contact_email: business.contactEmail,
                bank_name: business.bankName,
                account_number: business.accountNumber,
                ifsc_code: business.ifscCode,
                status: business.status,
                approval_status: business.approvalStatus,
                created_at: business.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch business profile',
            error: error.message
        });
    }
};

/**
 * Get approval status
 */
exports.getApprovalStatus = async (req, res) => {
    try {
        const business = await Business.findOne({ userId: req.user.id });

        if (!business) {
            return res.json({
                success: true,
                status: 'NOT_SUBMITTED'
            });
        }

        res.json({
            success: true,
            status: business.approvalStatus || 'NEW'
        });
    } catch (error) {
        console.error('Get approval status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch approval status',
            error: error.message
        });
    }
};

/**
 * Get dashboard stats for business
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const Project = models.Project;

        const totalProjects = await Project.countDocuments({ userId: req.user.id });
        const activeProjects = await Project.countDocuments({ userId: req.user.id, status: 'LIVE' });
        const pendingProjects = await Project.countDocuments({ userId: req.user.id, status: 'NEW' });

        res.json({
            success: true,
            stats: {
                total_projects: totalProjects,
                active_projects: activeProjects,
                pending_projects: pendingProjects,
                total_raised: 0, // TODO: Calculate from investments
                total_investors: 0 // TODO: Calculate from investments
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};
