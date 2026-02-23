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
                business_model: business.businessModel,
                owner_name: business.accountHolderName || business.userId?.email?.split('@')[0] || 'N/A',
                email: business.userId?.email || 'N/A',
                mobile: business.userId?.mobile || 'N/A',
                pan_number: 'N/A',
                gst_number: 'N/A',
                contact_person: business.accountHolderName || 'N/A',
                contact_email: business.userId?.email || 'N/A',
                contact_mobile: business.userId?.mobile || 'N/A',
                approval_status: business.approvalStatus,
                user_business_id: business.userBusinessId,
                created_at: business.createdAt,
                recheck_comments: business.rejectionComments?.comments || business.rejectionComments?.reason || null
            }))
        });
    } catch (error) {
        console.error('Get businesses error:', error);
        res.status(500).json({
            success: true,
            businesses: []
        });
    }
};

/**
 * Approve a business
 */
exports.approveBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id).populate('userId', 'email name');

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        business.approvalStatus = 'ACTIVE';
        if (!business.userBusinessId) {
            // Generate simple ID
            const count = await Business.countDocuments();
            business.userBusinessId = `BCM-BUS-${(count + 1).toString().padStart(4, '0')}`;
        }
        business.updatedAt = new Date();
        await business.save();

        const emailService = require('../services/emailService');
        if (business.userId && business.userId.email) {
            await emailService.sendBusinessApprovalEmail(business.userId.email, business.businessName, 'ACTIVE');
        }

        res.json({
            success: true,
            message: 'Business approved successfully, ID generated, and email sent',
            business
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
        const { reason } = req.body;
        const business = await Business.findById(req.params.id).populate('userId', 'email name');

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        business.approvalStatus = 'REJECTED';
        if (reason) business.rejectionComments = { reason };
        business.updatedAt = new Date();
        await business.save();

        const emailService = require('../services/emailService');
        if (business.userId && business.userId.email) {
            await emailService.sendBusinessApprovalEmail(business.userId.email, business.businessName, 'REJECTED', { reason });
        }

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
        const { comments } = req.body;
        const business = await Business.findById(req.params.id).populate('userId', 'email name');

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        business.approvalStatus = 'RECHECK';
        if (comments) business.rejectionComments = { comments }; // reuse field
        business.updatedAt = new Date();
        await business.save();

        const emailService = require('../services/emailService');
        if (business.userId && business.userId.email) {
            await emailService.sendBusinessApprovalEmail(business.userId.email, business.businessName, 'RECHECK', { comments });
        }

        res.json({
            success: true,
            message: 'Business marked for recheck and user notified'
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

exports.makeProjectLive = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        if (project.status !== 'APPROVED') {
            return res.status(400).json({ success: false, message: 'Only approved projects can be made live' });
        }
        project.status = 'LIVE';
        project.liveAt = new Date();
        await project.save();
        res.json({ success: true, message: 'Project is now live and visible for investment', project: { id: project._id, status: project.status, liveAt: project.liveAt } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to make project live', error: error.message });
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

const mapPlan = (p) => ({
    id: p._id,
    _id: p._id,
    plan_name: p.name || p.plan_name || '',
    name: p.name || p.plan_name || '',
    price: p.price || 0,
    validity_days: p.durationDays || p.validity_days || 0,
    durationDays: p.durationDays || p.validity_days || 0,
    max_projects: p.maxProjects || p.max_projects || 0,
    features: Array.isArray(p.features) ? p.features : (p.features ? [p.features] : []),
    is_active: p.isActive !== false,
    isActive: p.isActive !== false,
    created_at: p.createdAt,
    updatedAt: p.updatedAt
});

exports.getPlans = async (req, res) => {
    try {
        const Plan = models.Plan;
        const plans = await Plan.find({}).sort({ createdAt: -1 });
        res.json({ success: true, plans: plans.map(mapPlan) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get plans', error: error.message });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const Plan = models.Plan;
        const features = Array.isArray(req.body.features)
            ? req.body.features
            : typeof req.body.features === 'string'
                ? req.body.features.split('\n').filter(f => f.trim())
                : [];
        const planData = {
            name: req.body.plan_name || req.body.name || 'Unnamed Plan',
            description: req.body.description || '',
            price: parseFloat(req.body.price) || 0,
            durationDays: parseInt(req.body.validity_days || req.body.durationDays) || 30,
            maxProjects: parseInt(req.body.max_projects || req.body.maxProjects) || 0,
            features,
            isActive: req.body.is_active !== false
        };
        const plan = new Plan(planData);
        await plan.save();
        res.json({ success: true, message: 'Plan created', plan: mapPlan(plan) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create plan', error: error.message });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const Plan = models.Plan;
        const features = Array.isArray(req.body.features)
            ? req.body.features
            : typeof req.body.features === 'string'
                ? req.body.features.split('\n').filter(f => f.trim())
                : undefined;
        const planData = {
            ...(req.body.plan_name || req.body.name ? { name: req.body.plan_name || req.body.name } : {}),
            ...(req.body.price !== undefined ? { price: parseFloat(req.body.price) } : {}),
            ...(req.body.validity_days || req.body.durationDays ? { durationDays: parseInt(req.body.validity_days || req.body.durationDays) } : {}),
            ...(req.body.max_projects || req.body.maxProjects ? { maxProjects: parseInt(req.body.max_projects || req.body.maxProjects) } : {}),
            ...(features !== undefined ? { features } : {}),
            ...(req.body.description !== undefined ? { description: req.body.description } : {}),
            updatedAt: new Date()
        };
        const plan = await Plan.findByIdAndUpdate(req.params.id, planData, { new: true });
        res.json({ success: true, message: 'Plan updated', plan: plan ? mapPlan(plan) : null });
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

exports.getUserPlanSubscriptions = async (req, res) => {
    try {
        const UserPlan = models.UserPlan;
        const now = new Date();
        const filter = {};
        if (req.query.status === 'ACTIVE') filter.isActive = true;
        else if (req.query.status === 'EXPIRED') { filter.isActive = false; }

        const subs = await UserPlan.find(filter)
            .populate('userId', 'email mobile role')
            .populate('planId', 'name price durationDays')
            .sort({ activatedAt: -1 });

        const subscriptions = subs.map(s => ({
            id: s._id,
            user_email: s.userId?.email || 'N/A',
            user_mobile: s.userId?.mobile || 'N/A',
            plan_name: s.planId?.name || 'N/A',
            plan_price: s.planId?.price || 0,
            activated_at: s.activatedAt,
            expires_at: s.expiresAt,
            is_active: s.isActive,
            is_expired: s.expiresAt < now
        }));

        res.json({ success: true, subscriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get user plan subscriptions', error: error.message });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const PlatformSetting = models.PlatformSetting;
        const settingsArray = await PlatformSetting.find({});
        // Transform [{settingKey, settingValue}] array to flat object for frontend
        const settings = {};
        settingsArray.forEach(s => {
            if (s.settingKey) settings[s.settingKey] = s.settingValue;
        });
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
            if (updates[key] !== undefined && updates[key] !== null) {
                await PlatformSetting.findOneAndUpdate(
                    { settingKey: key },
                    { settingKey: key, settingValue: String(updates[key]) },
                    { upsert: true, new: true }
                );
            }
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
        const PlatformSetting = models.PlatformSetting;
        const ledgerService = require('../services/ledgerService');
        const { WALLET_TYPES, REFERENCE_TYPES } = require('../config/constants');

        const loan = await CapitalOption.findById(req.params.id).populate({
            path: 'projectId',
            select: 'userId'
        });

        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

        // Deduct Processing Fee
        const setting = await PlatformSetting.findOne({ settingKey: 'loan_processing_fee_percent' });
        const feePercent = setting ? parseFloat(setting.settingValue) : 0;
        let feeAmount = 0;

        if (feePercent > 0) {
            feeAmount = (loan.targetAmount * feePercent) / 100;
            const businessUserId = loan.projectId.userId;

            // Get Business Wallet
            const walletResult = await ledgerService.getWallet(businessUserId, WALLET_TYPES.BUSINESS);
            if (!walletResult.success) {
                return res.status(400).json({ success: false, message: 'Failed to access business wallet for fee deduction' });
            }

            // Deduct from Business Wallet
            const debitResult = await ledgerService.debitWallet(
                walletResult.wallet._id,
                feeAmount,
                `Loan Processing Fee (${feePercent}%)`,
                REFERENCE_TYPES.FEE || 'FEE',
                loan._id,
                null,
                req.user.id
            );

            if (!debitResult.success) {
                return res.status(400).json({ success: false, message: 'Insufficient balance for loan processing fee' });
            }

            // Credit to Admin Wallet
            const adminWalletResult = await ledgerService.getWallet(req.user.id, 'MAIN');
            if (adminWalletResult.success) {
                await ledgerService.creditWallet(
                    adminWalletResult.wallet._id,
                    feeAmount,
                    `Loan Processing Fee Received`,
                    REFERENCE_TYPES.FEE || 'FEE',
                    loan._id,
                    null,
                    req.user.id
                );
            }
        }

        loan.approvalStatus = 'APPROVED';
        loan.approvedAt = new Date();
        await loan.save();

        res.json({ success: true, message: `Loan approved successfully. Processing fee deducted: ₹${feeAmount}`, loan });
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
        const rawPartnerships = await CapitalOption.find(filter)
            .populate({
                path: 'projectId',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort({ createdAt: -1 });

        const partnerships = rawPartnerships.map(p => ({
            id: p._id,
            title: p.title || p.projectId?.projectName || 'Partnership Offer',
            description: p.description || 'No description provided.',
            investment_amount: p.minimumInvestment,
            equity_offered: p.profitSharingRatio || p.ownershipPercentage,
            status: p.approvalStatus,
            created_at: p.createdAt,
            businessId: {
                businessName: p.projectId?.userId?.name || 'Unknown User'
            }
        }));

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

// Activity Analytics
exports.getUserActivity = async (req, res) => {
    try {
        const recentLogins = await User.find({}).sort({ updatedAt: -1 }).limit(50).select('name email role updatedAt');
        const newSignups = await User.find({}).sort({ createdAt: -1 }).limit(50).select('name email role createdAt');
        res.json({ success: true, recentLogins, newSignups });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get user activity', error: error.message });
    }
};

// Revenue Reports
exports.getRevenueReports = async (req, res) => {
    try {
        const LedgerEntry = models.LedgerEntry;
        const revenueTransactions = await LedgerEntry.find({ referenceType: { $in: ['FEE', 'SUBSCRIPTION', 'COMMISSION'] } })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 }).limit(100);

        let totalRevenue = 0;
        revenueTransactions.forEach(t => totalRevenue += parseFloat(t.amount.toString()));

        res.json({ success: true, revenueTransactions, totalRevenue });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get revenue reports', error: error.message });
    }
};

// Banners
exports.getBanners = async (req, res) => {
    try {
        const Banner = models.Banner;
        const banners = await Banner.find({}).sort({ createdAt: -1 });
        res.json({ success: true, banners });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get banners', error: error.message });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const Banner = models.Banner;
        const banner = new Banner(req.body);
        await banner.save();
        res.json({ success: true, message: 'Banner created', banner });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create banner', error: error.message });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const Banner = models.Banner;
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete banner', error: error.message });
    }
};

// Announcements
exports.getAnnouncements = async (req, res) => {
    try {
        const Announcement = models.Announcement;
        const announcements = await Announcement.find({}).sort({ createdAt: -1 });
        res.json({ success: true, announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get announcements', error: error.message });
    }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const Announcement = models.Announcement;
        const announcement = new Announcement(req.body);
        await announcement.save();
        res.json({ success: true, message: 'Announcement created', announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create announcement', error: error.message });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const Announcement = models.Announcement;
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete announcement', error: error.message });
    }
};

// Generated Docs
exports.getGeneratedDocs = async (req, res) => {
    try {
        const GeneratedDocument = models.GeneratedDocument;
        const docs = await GeneratedDocument.find({})
            .populate('userId', 'name email')
            .populate('templateId', 'templateName type')
            .sort({ generatedAt: -1 }).limit(100);
        res.json({ success: true, docs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get generated documents', error: error.message });
    }
};
