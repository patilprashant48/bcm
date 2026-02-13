const models = require('../database/mongodb-schema');
const Project = models.Project;
const Investment = models.Investment;
const Watchlist = models.Watchlist;
const Announcement = models.Announcement;

/**
 * Get all live projects for investors
 */
exports.getLiveProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: 'LIVE' })
            .populate('userId', 'email mobile')
            .sort({ liveAt: -1 })
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
                raised_capital: 0, // TODO: Calculate from investments
                location: project.location,
                start_date: project.startDate,
                business_name: project.userId?.email, // TODO: Get from business profile
                created_at: project.createdAt
            }))
        });
    } catch (error) {
        console.error('Get live projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch live projects',
            error: error.message
        });
    }
};

/**
 * Get investor portfolio
 */
exports.getPortfolio = async (req, res) => {
    try {
        const investments = await Investment.find({ userId: req.user.id })
            .populate('projectId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            portfolio: investments.map(inv => ({
                id: inv._id,
                project_name: inv.projectId?.projectName,
                amount_invested: inv.amount,
                investment_type: inv.investmentType,
                investment_date: inv.createdAt,
                status: inv.status
            })),
            total_invested: investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
        });
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({
            success: true, // Return success with empty portfolio
            portfolio: [],
            total_invested: 0
        });
    }
};

/**
 * Add project to watchlist
 */
exports.addToWatchlist = async (req, res) => {
    try {
        const { projectId } = req.body;

        // Check if already in watchlist
        const existing = await Watchlist.findOne({
            userId: req.user.id,
            projectId: projectId
        });

        if (existing) {
            return res.json({
                success: true,
                message: 'Project already in watchlist'
            });
        }

        const watchlistItem = new Watchlist({
            userId: req.user.id,
            projectId: projectId
        });

        await watchlistItem.save();

        res.json({
            success: true,
            message: 'Project added to watchlist'
        });
    } catch (error) {
        console.error('Add to watchlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add to watchlist',
            error: error.message
        });
    }
};

/**
 * Get user's watchlist
 */
exports.getWatchlist = async (req, res) => {
    try {
        const watchlist = await Watchlist.find({ userId: req.user.id })
            .populate('projectId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            watchlist: watchlist.map(item => ({
                id: item._id,
                project: {
                    id: item.projectId?._id,
                    project_name: item.projectId?.projectName,
                    description: item.projectId?.description,
                    required_capital: item.projectId?.requiredCapital,
                    status: item.projectId?.status
                },
                added_at: item.createdAt
            }))
        });
    } catch (error) {
        console.error('Get watchlist error:', error);
        res.status(500).json({
            success: true, // Return success with empty watchlist
            watchlist: []
        });
    }
};

/**
 * Get active announcements
 */
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            announcements: announcements.map(ann => ({
                id: ann._id,
                title: ann.title,
                content: ann.content,
                type: ann.type,
                created_at: ann.createdAt
            }))
        });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({
            success: true, // Return success with empty list
            announcements: []
        });
    }
};

/**
 * Get project details by ID
 */
exports.getProjectDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const project = await Project.findById(id)
            .populate('userId', 'email mobile name');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Calculate raised capital from investments
        const investments = await Investment.find({ projectId: id });
        const raisedCapital = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

        res.json({
            success: true,
            project: {
                id: project._id,
                project_name: project.projectName,
                campaign_name: project.campaignName,
                description: project.description,
                project_type: project.projectType,
                category: project.category,
                target_amount: project.requiredCapital,
                raised_amount: raisedCapital,
                min_investment: project.minInvestment || 1000,
                location: project.location,
                start_date: project.startDate,
                end_date: project.endDate,
                status: project.status,
                business_name: project.userId?.name || project.userId?.email,
                business_owner: project.userId?.name,
                created_at: project.createdAt,
                updated_at: project.updatedAt,
                investors_count: investments.length
            }
        });
    } catch (error) {
        console.error('Get project details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project details',
            error: error.message
        });
    }
};

/**
 * Buy shares/invest in project
 */
exports.buyShares = async (req, res) => {
    try {
        const { projectId, amount, investmentType } = req.body;
        const userId = req.user.id;

        // Validate project exists and is live
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.status !== 'LIVE') {
            return res.status(400).json({
                success: false,
                message: 'Project is not accepting investments'
            });
        }

        // Check minimum investment
        if (amount < (project.minInvestment || 1000)) {
            return res.status(400).json({
                success: false,
                message: `Minimum investment is ₹${project.minInvestment || 1000}`
            });
        }

        // TODO: Check wallet balance
        // TODO: Deduct from wallet
        
        // Create investment record
        const investment = new Investment({
            userId: userId,
            projectId: projectId,
            amount: parseFloat(amount),
            investmentType: investmentType || 'EQUITY',
            status: 'ACTIVE',
            investmentDate: new Date()
        });

        await investment.save();

        // TODO: Update project raised capital
        // TODO: Create wallet transaction

        res.json({
            success: true,
            message: 'Investment successful',
            investment: {
                id: investment._id,
                amount: investment.amount,
                project_name: project.projectName,
                investment_date: investment.investmentDate
            }
        });
    } catch (error) {
        console.error('Buy shares error:', error);
        res.status(500).json({
            success: false,
            message: 'Investment failed',
            error: error.message
        });
    }
};
