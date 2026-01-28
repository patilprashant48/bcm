const models = require('../database/mongodb-schema');
const Project = models.Project;
const User = models.User;
const Business = models.Business || models.BusinessProfile;

/**
 * Get all projects for admin (with optional status filter)
 */
exports.getProjects = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = {};
        if (status) {
            filter.status = status;
        }

        const projects = await Project.find(filter)
            .populate('userId', 'email mobile')
            .sort({ createdAt: -1 })
            .select('-__v');

        res.json({
            success: true,
            projects: projects.map(project => ({
                id: project._id,
                project_name: project.projectName,
                description: project.description,
                project_type: project.projectType,
                category: project.category,
                required_capital: project.requiredCapital,
                project_cost: project.projectCost,
                location: project.location,
                start_date: project.startDate,
                status: project.status,
                business_email: project.userId?.email,
                business_mobile: project.userId?.mobile,
                created_at: project.createdAt,
                updated_at: project.updatedAt,
                approved_at: project.approvedAt,
                live_at: project.liveAt
            }))
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message
        });
    }
};

/**
 * Approve a project
 */
exports.approveProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        project.status = 'APPROVED';
        project.approvedAt = new Date();
        await project.save();

        res.json({
            success: true,
            message: 'Project approved successfully',
            project: {
                id: project._id,
                project_name: project.projectName,
                status: project.status,
                approved_at: project.approvedAt
            }
        });
    } catch (error) {
        console.error('Approve project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve project',
            error: error.message
        });
    }
};

/**
 * Reject a project
 */
exports.rejectProject = async (req, res) => {
    try {
        const { reason } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        project.status = 'REJECTED';
        await project.save();

        res.json({
            success: true,
            message: 'Project rejected successfully',
            project: {
                id: project._id,
                project_name: project.projectName,
                status: project.status
            }
        });
    } catch (error) {
        console.error('Reject project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject project',
            error: error.message
        });
    }
};

/**
 * Request recheck for a project
 */
exports.recheckProject = async (req, res) => {
    try {
        const { notes } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        project.status = 'RECHECK';
        await project.save();

        res.json({
            success: true,
            message: 'Project marked for recheck',
            project: {
                id: project._id,
                project_name: project.projectName,
                status: project.status
            }
        });
    } catch (error) {
        console.error('Recheck project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark project for recheck',
            error: error.message
        });
    }
};

/**
 * Get all businesses for admin
 */
exports.getBusinesses = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = {};
        if (status) {
            filter.approvalStatus = status;
        }

        const businesses = await Business.find(filter)
            .populate('userId', 'email mobile')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            businesses: businesses.map(business => ({
                id: business._id,
                business_name: business.businessName,
                business_type: business.businessType,
                business_model: business.businessModel, // Added
                owner_name: business.contactPerson || business.userId?.name || 'N/A', // Mapped to owner_name
                email: business.contactEmail || business.userId?.email || 'N/A', // Mapped to email
                mobile: business.contactMobile || business.userId?.mobile || 'N/A', // Mapped to mobile
                pan_number: business.pan, // Mapped to pan_number
                gst_number: business.gst, // Mapped to gst_number
                contact_person: business.contactPerson,
                contact_email: business.contactEmail,
                contact_mobile: business.contactMobile,
                city: business.city,
                state: business.state,
                approval_status: business.approvalStatus,
                created_at: business.createdAt
            }))
        });
    } catch (error) {
        console.error('Get businesses error:', error);
        res.status(500).json({
            success: true, // Return success with empty list
            businesses: []
        });
    }
};

/**
 * Approve a business
 */
exports.approveBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        business.approvalStatus = 'ACTIVE';
        await business.save();

        res.json({
            success: true,
            message: 'Business approved successfully'
        });
    } catch (error) {
        console.error('Approve business error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve business',
            error: error.message
        });
    }
};

/**
 * Reject a business
 */
exports.rejectBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        business.approvalStatus = 'REJECTED';
        await business.save();

        res.json({
            success: true,
            message: 'Business rejected successfully'
        });
    } catch (error) {
        console.error('Reject business error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject business',
            error: error.message
        });
    }
};

/**
 * Request recheck for a business
 */
exports.recheckBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        business.approvalStatus = 'RECHECK';
        await business.save();

        res.json({
            success: true,
            message: 'Business marked for recheck'
        });
    } catch (error) {
        console.error('Recheck business error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark business for recheck',
            error: error.message
        });
    }
};

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();
        const pendingProjects = await Project.countDocuments({ status: 'NEW' });
        const approvedProjects = await Project.countDocuments({ status: 'APPROVED' });
        const liveProjects = await Project.countDocuments({ status: 'LIVE' });
        const rejectedProjects = await Project.countDocuments({ status: 'REJECTED' });

        const totalUsers = await User.countDocuments();
        const businessUsers = await User.countDocuments({ role: 'BUSINESS_USER' });
        const investors = await User.countDocuments({ role: 'INVESTOR' });

        const totalBusinesses = await Business.countDocuments();
        const pendingBusinesses = await Business.countDocuments({ approvalStatus: 'NEW' });
        const approvedBusinesses = await Business.countDocuments({ approvalStatus: 'ACTIVE' });

        res.json({
            success: true,
            stats: {
                projects: {
                    total: totalProjects,
                    pending: pendingProjects,
                    approved: approvedProjects,
                    live: liveProjects,
                    rejected: rejectedProjects
                },
                users: {
                    total: totalUsers,
                    businesses: businessUsers,
                    investors: investors
                },
                businesses: {
                    total: totalBusinesses,
                    pending: pendingBusinesses,
                    approved: approvedBusinesses
                }
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
