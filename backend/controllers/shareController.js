const models = require('../database/mongodb-schema');
const ledgerService = require('../services/ledgerService');
const { WALLET_TYPES, REFERENCE_TYPES, ROLES } = require('../config/constants');

/**
 * Create a new Share Offering
 */
exports.createShare = async (req, res) => {
    try {
        const {
            share_name,
            total_shares,
            price_per_share,
            description,
            project_id // Optional: link to a project
        } = req.body;

        const userId = req.user.id; // Business User

        // 1. Create Share Definition
        // If no project_id is provided, we might need a "General Business Share" or require a project.
        // For now, if project_id is missing, we'll create a "General" placeholder project or handle it loosely.
        // But the schema requires `projectId`.
        // Let's check if the frontend sends project_id. The CapitalTools.jsx didn't seem to have a project selector.
        // We might need to find a default project for the user or create one.
        // OR: Update schema to make projectId optional?
        // Let's assume for now we need to find ANY project or just pick the first one, or create a dummy.
        // BETTER: Retrieve the user's "Business Profile" and treat it as the entity issues shares.
        // However, schema says `ref: 'Project'`.
        // Let's try to find an existing project for the user.

        let projectId = project_id;
        if (!projectId) {
            const project = await models.Project.findOne({ userId });
            if (project) {
                projectId = project._id;
            } else {
                // If no project exists, we can't properly link it according to strict schema.
                // But for "Make it work", let's Create a Default "General Business" Project if none exists.
                const newProject = await models.Project.create({
                    userId,
                    projectName: 'General Business Operations',
                    startDate: new Date(),
                    location: 'Headquarters',
                    category: 'OFFLINE',
                    projectType: 'business_expansion',
                    requiredCapital: 0,
                    projectCost: 0,
                    status: 'LIVE',
                    description: 'General business operations and expansion'
                });
                projectId = newProject._id;
            }
        }

        const total = parseInt(total_shares);
        // 50% Owner Reserved, 50% Market
        const reserved = Math.floor(total / 2);
        const market = total - reserved;

        const share = await models.Share.create({
            projectId,
            shareName: share_name,
            totalShares: total,
            shareValue: parseFloat(price_per_share), // Initial Face Value
            currentPrice: parseFloat(price_per_share),
            marketShares: market, // 50% Open for sale
            ownerShares: reserved, // 50% Reserved for Owner
            approvalStatus: 'PENDING', // Needs Admin Approval
            isApproved: false, // Deprecated but might be needed for old code compatibility? keeping both for safety or just relying on status.
            // Schema has default 'PENDING' for status.
            description
        });

        res.json({
            success: true,
            message: 'Share offering created successfully. Pending Admin Approval.',
            share
        });
    } catch (error) {
        console.error('Create share error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create share offering',
            error: error.message
        });
    }
};

/**
 * Get Shares for User (Business Dashboard) or All (Investor Market)
 */
exports.getShares = async (req, res) => {
    try {
        // If business user, show THEIR shares. If investor, show Approved Market Shares.
        const userId = req.user.id;
        const role = req.user.role;

        let query = {};
        if (role === ROLES.BUSINESS_USER) {
            // Find projects by this user first?
            const projects = await models.Project.find({ userId });
            const projectIds = projects.map(p => p._id);
            query = { projectId: { $in: projectIds } };
        } else {
            // Investor: Show Active/Approved only
            query = { approvalStatus: 'APPROVED' };
        }

        const shares = await models.Share.find(query).populate('projectId');

        res.json({
            success: true,
            shares
        });
    } catch (error) {
        console.error('Get shares error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get shares',
            error: error.message
        });
    }
};

/**
 * Investor Buys Shares
 */
exports.buyShares = async (req, res) => {
    try {
        const { shareId, quantity } = req.body;
        const userId = req.user.id;

        const share = await models.Share.findById(shareId).populate({
            path: 'projectId',
            populate: { path: 'userId' } // Business User
        });

        if (!share || share.approvalStatus !== 'APPROVED') {
            return res.status(404).json({ success: false, message: 'Share not found or not available' });
        }

        const totalCost = share.currentPrice * parseInt(quantity);

        // 1. Check/Debit Investor Wallet
        const investorWalletRes = await ledgerService.getWallet(userId, WALLET_TYPES.INVESTOR_BUSINESS);
        if (!investorWalletRes.success) throw new Error('Investor wallet not found');

        // Debit
        const debitRes = await ledgerService.debitWallet(
            investorWalletRes.wallet._id,
            totalCost,
            `Bought ${quantity} shares of ${share.shareName}`,
            REFERENCE_TYPES.INVESTMENT || 'INVESTMENT',
            share._id,
            { quantity, price: share.currentPrice },
            userId
        );

        if (!debitRes.success) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // 2. Credit Business User
        const businessUserId = share.projectId.userId._id;
        const businessWalletRes = await ledgerService.getWallet(businessUserId, WALLET_TYPES.BUSINESS);
        if (businessWalletRes.success) {
            await ledgerService.creditWallet(
                businessWalletRes.wallet._id,
                totalCost,
                `Share Purchase: ${quantity} x ${share.shareName}`,
                REFERENCE_TYPES.INVESTMENT || 'INVESTMENT',
                share._id,
                { investor_id: userId, quantity },
                userId
            );
        }

        // 3. Record Holding
        let holding = await models.ShareHolding.findOne({ userId, shareId });
        if (holding) {
            // Average Price Calc
            const oldTotal = holding.quantity * holding.averagePrice;
            const newTotal = oldTotal + totalCost;
            holding.quantity += parseInt(quantity);
            holding.averagePrice = newTotal / holding.quantity;
            await holding.save();
        } else {
            await models.ShareHolding.create({
                userId,
                shareId,
                quantity: parseInt(quantity),
                averagePrice: share.currentPrice
            });
        }

        // 4. Record Transaction
        await models.ShareTransaction.create({
            userId,
            shareId,
            transactionType: 'BUY',
            quantity: parseInt(quantity),
            pricePerShare: share.currentPrice,
            totalAmount: totalCost
        });

        res.json({
            success: true,
            message: 'Shares purchased successfully'
        });

    } catch (error) {
        console.error('Buy shares error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to buy shares',
            error: error.message
        });
    }
};
/**
 * Admin: Approve Share
 */
exports.approveShare = async (req, res) => {
    try {
        const { shareId } = req.params;
        const { approved } = req.body; // true or false

        const share = await models.Share.findById(shareId);
        if (!share) {
            return res.status(404).json({ success: false, message: 'Share not found' });
        }

        share.isApproved = approved;
        if (approved) {
            share.approvedAt = new Date();
        }
        await share.save();

        res.json({
            success: true,
            message: `Share offering ${approved ? 'approved' : 'rejected'}`,
            share
        });
    } catch (error) {
        console.error('Approve share error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve share', error: error.message });
    }
};
