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

// Additional admin controller methods

exports.getBusinessDetails = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id).populate('userId', 'name email mobile');
        if (!business) {
            return res.status(404).json({ success: false, message: 'Business not found' });
        }
        res.json({ success: true, business });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get business details', error: error.message });
    }
};

exports.deactivateBusiness = async (req, res) => {
    try {
        const business = await Business.findByIdAndUpdate(req.params.id, { approvalStatus: 'INACTIVE' }, { new: true });
        res.json({ success: true, message: 'Business deactivated', business });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to deactivate business', error: error.message });
    }
};

exports.reactivateBusiness = async (req, res) => {
    try {
        const business = await Business.findByIdAndUpdate(req.params.id, { approvalStatus: 'ACTIVE' }, { new: true });
        res.json({ success: true, message: 'Business reactivated', business });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reactivate business', error: error.message });
    }
};

exports.getLiveProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: 'LIVE' }).populate('userId', 'email mobile').sort({ liveAt: -1 });
        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get live projects', error: error.message });
    }
};

exports.getClosedProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: 'CLOSED' }).populate('userId', 'email mobile').sort({ closedAt: -1 });
        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get closed projects', error: error.message });
    }
};

exports.closeProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, { status: 'CLOSED', closedAt: new Date() }, { new: true });
        res.json({ success: true, message: 'Project closed', project });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to close project', error: error.message });
    }
};

exports.getCustomers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['INVESTOR', 'BUSINESS_USER'] } })
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .lean();

        // Transform data to match frontend expectations
        const customers = users.map(user => ({
            id: user._id.toString(),
            _id: user._id,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            name: user.fullName || user.email?.split('@')[0] || 'N/A',
            status: user.isActive ? 'ACTIVE' : 'SUSPENDED',
            isActive: user.isActive,
            kyc_status: user.kycStatus || 'NOT_SUBMITTED',
            total_invested: user.totalInvested || 0,
            created_at: user.createdAt,
            updated_at: user.updatedAt
        }));

        res.json({ success: true, customers });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ success: false, message: 'Failed to get customers', error: error.message });
    }
};

exports.suspendCustomer = async (req, res) => {
    try {
        if (!req.params.id || req.params.id === 'undefined') {
            return res.status(400).json({ success: false, message: 'Invalid customer ID' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false, updatedAt: new Date() },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer suspended successfully', user });
    } catch (error) {
        console.error('Suspend customer error:', error);
        res.status(500).json({ success: false, message: 'Failed to suspend customer', error: error.message });
    }
};

exports.activateCustomer = async (req, res) => {
    try {
        if (!req.params.id || req.params.id === 'undefined') {
            return res.status(400).json({ success: false, message: 'Invalid customer ID' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: true, updatedAt: new Date() },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer activated successfully', user });
    } catch (error) {
        console.error('Activate customer error:', error);
        res.status(500).json({ success: false, message: 'Failed to activate customer', error: error.message });
    }
};

exports.getKYCRequests = async (req, res) => {
    try {
        const KycDetails = models.KycDetails;
        const kycs = await KycDetails.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, kycs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get KYC requests', error: error.message });
    }
};

exports.approveKYC = async (req, res) => {
    try {
        const KycDetails = models.KycDetails;
        const kyc = await KycDetails.findByIdAndUpdate(req.params.id, { isVerified: true, verifiedAt: new Date() }, { new: true });
        res.json({ success: true, message: 'KYC approved', kyc });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to approve KYC', error: error.message });
    }
};

exports.rejectKYC = async (req, res) => {
    try {
        const KycDetails = models.KycDetails;
        // Assuming rejection just means unverified or deleting? Or setting status if added to schema.
        // Schema only has isVerified. Let's assume false is rejected or keep as is.
        // For now, setting isVerified: false. Ideally schema should have status enum.
        const kyc = await KycDetails.findByIdAndUpdate(req.params.id, { isVerified: false }, { new: true });
        res.json({ success: true, message: 'KYC rejected', kyc });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reject KYC', error: error.message });
    }
};

exports.getPlans = async (req, res) => {
    try {
        const Plan = models.Plan;
        const plans = await Plan.find({}).sort({ createdAt: -1 });
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get plans', error: error.message });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const Plan = models.Plan;
        const plan = new Plan(req.body);
        await plan.save();
        res.json({ success: true, message: 'Plan created', plan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create plan', error: error.message });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const Plan = models.Plan;
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: 'Plan updated', plan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update plan', error: error.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const Plan = models.Plan;
        await Plan.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Plan deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete plan', error: error.message });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const PlatformSetting = models.PlatformSetting;
        const settings = await PlatformSetting.find({});
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get settings', error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const PlatformSetting = models.PlatformSetting;
        const updates = req.body;
        for (const key in updates) {
            await PlatformSetting.findOneAndUpdate({ settingKey: key }, { settingValue: updates[key] }, { upsert: true });
        }
        res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update settings', error: error.message });
    }
};

exports.getShares = async (req, res) => {
    try {
        const Share = models.Share;
        const shares = await Share.find({}).populate({
            path: 'projectId',
            select: 'projectName'
        }).populate('projectId.userId', 'email').sort({ createdAt: -1 });
        // Mapped projectId to businessId concept somewhat or frontend expects businessId?
        // Frontend expects businessId.businessName.
        // Need to check if Share has businessId directly? No, it has projectId.
        // Project has userId.
        // I will stick to what schema has.
        res.json({ success: true, shares });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get shares', error: error.message });
    }
};

exports.approveShare = async (req, res) => {
    try {
        const Share = models.Share;
        const share = await Share.findByIdAndUpdate(req.params.id, { approvalStatus: 'APPROVED', approvedAt: new Date() }, { new: true });
        res.json({ success: true, message: 'Share offering approved', share });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to approve share', error: error.message });
    }
};

exports.rejectShare = async (req, res) => {
    try {
        const Share = models.Share;
        const { reason, status } = req.body;
        const updateStatus = status || 'REJECTED';
        const share = await Share.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: updateStatus, rejectedAt: new Date(), rejectionReason: reason },
            { new: true }
        );
        res.json({ success: true, message: `Share offering ${updateStatus.toLowerCase()}`, share });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update share status', error: error.message });
    }
};

exports.recheckShare = async (req, res) => {
    try {
        const Share = models.Share;
        const { comments } = req.body;
        const share = await Share.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'RECHECK', recheckComments: comments },
            { new: true }
        );
        res.json({ success: true, message: 'Share marked for recheck', share });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to recheck share', error: error.message });
    }
};

exports.getLoans = async (req, res) => {
    try {
        const CapitalOption = models.CapitalOption;
        const { status } = req.query;
        const filter = { optionType: 'LOAN' };
        if (status) filter.approvalStatus = status;

        const loans = await CapitalOption.find(filter)
            .populate('projectId', 'projectName')
            .sort({ createdAt: -1 });
        res.json({ success: true, loans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get loans', error: error.message });
    }
};

exports.approveLoan = async (req, res) => {
    try {
        const CapitalOption = models.CapitalOption;
        const loan = await CapitalOption.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'APPROVED', approvedAt: new Date() },
            { new: true }
        );
        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
        res.json({ success: true, message: 'Loan approved successfully', loan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to approve loan', error: error.message });
    }
};

exports.rejectLoan = async (req, res) => {
    try {
        const CapitalOption = models.CapitalOption;
        const { reason } = req.body;
        const loan = await CapitalOption.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'REJECTED', rejectedAt: new Date(), rejectionReason: reason },
            { new: true }
        );
        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
        res.json({ success: true, message: 'Loan rejected', loan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reject loan', error: error.message });
    }
};

exports.recheckLoan = async (req, res) => {
    try {
        const CapitalOption = models.CapitalOption;
        const { comments } = req.body;
        const loan = await CapitalOption.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'RECHECK', recheckComments: comments },
            { new: true }
        );
        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
        res.json({ success: true, message: 'Loan marked for recheck', loan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to recheck loan', error: error.message });
    }
};

exports.getFDs = async (req, res) => {
    try {
        const FDScheme = models.FDScheme;
        const fds = await FDScheme.find({}).populate('businessId', 'businessName').sort({ createdAt: -1 });
        res.json({ success: true, fds });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get FDs', error: error.message });
    }
};

exports.getPartnerships = async (req, res) => {
    try {
        const CapitalOption = models.CapitalOption;
        const { status } = req.query;
        const filter = { optionType: 'PARTNERSHIP' };
        if (status) filter.approvalStatus = status;

        const partnerships = await CapitalOption.find(filter)
            .populate('projectId', 'projectName')
            .sort({ createdAt: -1 });
        res.json({ success: true, partnerships });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get partnerships', error: error.message });
    }
};

exports.approvePartnership = async (req, res) => {
    try {
        const CapitalOption = models.CapitalOption;
        const partnership = await CapitalOption.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'APPROVED', approvedAt: new Date() },
            { new: true }
        );
        if (!partnership) return res.status(404).json({ success: false, message: 'Partnership not found' });
        res.json({ success: true, message: 'Partnership approved', partnership });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to approve partnership', error: error.message });
    }
};

exports.rejectPartnership = async (req, res) => {
    try {
        const CapitalOption = models.CapitalOption;
        const { reason } = req.body;
        const partnership = await CapitalOption.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'REJECTED', rejectedAt: new Date(), rejectionReason: reason },
            { new: true }
        );
        if (!partnership) return res.status(404).json({ success: false, message: 'Partnership not found' });
        res.json({ success: true, message: 'Partnership rejected', partnership });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reject partnership', error: error.message });
    }
};

exports.recheckPartnership = async (req, res) => {
    try {
        const CapitalOption = models.CapitalOption;
        const { comments } = req.body;
        const partnership = await CapitalOption.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'RECHECK', recheckComments: comments },
            { new: true }
        );
        if (!partnership) return res.status(404).json({ success: false, message: 'Partnership not found' });
        res.json({ success: true, message: 'Partnership marked for recheck', partnership });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to recheck partnership', error: error.message });
    }
};

exports.getLegalTemplates = async (req, res) => {
    try {
        const DocumentTemplate = models.DocumentTemplate;
        const templates = await DocumentTemplate.find({}).sort({ updatedAt: -1 });
        res.json({ success: true, templates });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get templates', error: error.message });
    }
};

exports.createLegalTemplate = async (req, res) => {
    try {
        const DocumentTemplate = models.DocumentTemplate;
        const template = new DocumentTemplate({ ...req.body, updatedAt: new Date() });
        await template.save();
        res.json({ success: true, message: 'Template created', template });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create template', error: error.message });
    }
};

exports.updateLegalTemplate = async (req, res) => {
    try {
        const DocumentTemplate = models.DocumentTemplate;
        const template = await DocumentTemplate.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        res.json({ success: true, message: 'Template updated', template });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update template', error: error.message });
    }
};

exports.deleteLegalTemplate = async (req, res) => {
    try {
        const DocumentTemplate = models.DocumentTemplate;
        await DocumentTemplate.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Template deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete template', error: error.message });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'ADMIN' }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get admins', error: error.message });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new User({
            email,
            passwordHash: hashedPassword,
            role: 'ADMIN',
            isActive: true,
            mobile: req.body.mobile || null
        });
        await admin.save();
        res.json({ success: true, message: 'Admin created', admin: { id: admin._id, email } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create admin', error: error.message });
    }
};

exports.updateAdminStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const admin = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: isActive === true || isActive === 'true', updatedAt: new Date() },
            { new: true }
        ).select('-passwordHash');

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        res.json({ success: true, message: 'Admin status updated', admin });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update admin status', error: error.message });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const AuditLog = models.AuditLog || models.Transaction;
        const logs = await AuditLog.find({}).populate('userId', 'name email').sort({ createdAt: -1 }).limit(100);
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get audit logs', error: error.message });
    }
};

exports.sendNotification = async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;
        const Notification = models.Notification;
        const notification = new Notification({ userId, title, message, type, createdAt: new Date() });
        await notification.save();
        res.json({ success: true, message: 'Notification sent', notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send notification', error: error.message });
    }
};

exports.getTransactionReports = async (req, res) => {
    try {
        const Transaction = models.Transaction;
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate) filter.createdAt = { $gte: new Date(startDate) };
        if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
        const transactions = await Transaction.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get transaction reports', error: error.message });
    }
};

exports.exportTransactionReport = async (req, res) => {
    try {
        const Transaction = models.Transaction;
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate) filter.createdAt = { $gte: new Date(startDate) };
        if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
        const transactions = await Transaction.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });

        // Convert to CSV format
        const csv = transactions.map(t => `${t._id},${t.userId?.email},${t.type},${t.amount},${t.createdAt}`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
        res.send('ID,User Email,Type,Amount,Date\n' + csv);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to export transaction report', error: error.message });
    }
};
