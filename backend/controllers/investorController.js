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
