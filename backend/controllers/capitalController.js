const models = require('../database/mongodb-schema');
const ledgerService = require('../services/ledgerService');
const { WALLET_TYPES, REFERENCE_TYPES, ROLES } = require('../config/constants');

/**
 * Helper to get or create a default project for the user
 */
const getOrCreateProject = async (userId) => {
    let project = await models.Project.findOne({ userId });
    if (!project) {
        project = await models.Project.create({
            userId,
            projectName: 'General Business Operations',
            startDate: new Date(),
            location: 'Headquarters',
            category: 'OFFLINE',
            projectType: 'BUSINESS_EXPANSION',
            requiredCapital: 0,
            projectCost: 0,
            status: 'LIVE',
            description: 'General business operations and expansion'
        });
    }
    return project;
};

/**
 * Create Loan Option
 */
exports.createLoan = async (req, res) => {
    try {
        const {
            scheme_name, // Not in CapitalOption schema, maybe used for UI? 
            loan_amount,
            interest_rate,
            tenure_months,
            project_id
        } = req.body;

        const userId = req.user.id;
        const project = project_id
            ? await models.Project.findById(project_id)
            : await getOrCreateProject(userId);

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        // Calculate approximate EMI (Simple interest for MVP?)
        const r = interest_rate / 12 / 100;
        const emi = (loan_amount * r * Math.pow(1 + r, tenure_months)) / (Math.pow(1 + r, tenure_months) - 1);

        const capitalOption = await models.CapitalOption.create({
            projectId: project._id,
            optionType: 'LOAN',
            loanAmount: parseFloat(loan_amount),
            interestRate: parseFloat(interest_rate),
            tenureMonths: parseInt(tenure_months),
            emiAmount: emi || 0,
            isActive: true
        });

        res.json({
            success: true,
            message: 'Loan scheme created successfully',
            capitalOption
        });
    } catch (error) {
        console.error('Create Loan error:', error);
        res.status(500).json({ success: false, message: 'Failed to create loan scheme', error: error.message });
    }
};

/**
 * Create Partnership Option
 */
exports.createPartnership = async (req, res) => {
    try {
        const {
            partnership_name,
            investment_amount,
            profit_share_percentage,
            project_id
        } = req.body;

        const userId = req.user.id;
        const project = project_id
            ? await models.Project.findById(project_id)
            : await getOrCreateProject(userId);

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        const capitalOption = await models.CapitalOption.create({
            projectId: project._id,
            optionType: 'PARTNERSHIP',
            minimumInvestment: parseFloat(investment_amount),
            profitSharingRatio: parseFloat(profit_share_percentage),
            payoutFrequency: 'YEARLY', // Default
            isActive: true
        });

        res.json({
            success: true,
            message: 'Partnership offering created successfully',
            capitalOption
        });
    } catch (error) {
        console.error('Create Partnership error:', error);
        res.status(500).json({ success: false, message: 'Failed to create partnership', error: error.message });
    }
};

/**
 * Get Capital Options (Loans/Partnerships)
 */
exports.getCapitalOptions = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let query = {};
        if (role === ROLES.BUSINESS_USER) {
            const projects = await models.Project.find({ userId });
            const projectIds = projects.map(p => p._id);
            query = { projectId: { $in: projectIds } };
        } else {
            // Investor: Show Active
            query = { isActive: true };
        }

        const options = await models.CapitalOption.find(query).populate('projectId');

        res.json({
            success: true,
            options
        });
    } catch (error) {
        console.error('Get Capital Options error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch options', error: error.message });
    }
};

/**
 * Invest in Capital Option
 */
exports.investInCapitalOption = async (req, res) => {
    try {
        const { optionId, amount } = req.body;
        const userId = req.user.id; // Investor

        const option = await models.CapitalOption.findById(optionId).populate({
            path: 'projectId',
            populate: { path: 'userId' }
        });

        if (!option || !option.isActive) {
            return res.status(404).json({ success: false, message: 'Capital option not found or inactive' });
        }

        // Validate Amount
        if (option.optionType === 'PARTNERSHIP' && amount < option.minimumInvestment) {
            return res.status(400).json({ success: false, message: `Minimum investment is ${option.minimumInvestment}` });
        }
        if (option.optionType === 'LOAN' && amount > option.loanAmount) {
            // For Loan, usually multiple investors can contribute, or single?
            // Assuming user can partial fund or full fund. 
            // Let's assume partial funding allowed up to remaining.
            // For MVP, simplistic check.
        }

        // 1. Debit Investor
        const investorWalletRes = await ledgerService.getWallet(userId, WALLET_TYPES.INVESTOR_BUSINESS);
        if (!investorWalletRes.success) throw new Error('Investor wallet not found');

        const debitRes = await ledgerService.debitWallet(
            investorWalletRes.wallet._id,
            parseFloat(amount),
            `Investment in ${option.optionType}: ${option.projectId.projectName}`,
            REFERENCE_TYPES.INVESTMENT || 'INVESTMENT',
            option._id,
            { option_type: option.optionType },
            userId
        );

        if (!debitRes.success) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // 2. Credit Business User
        const businessUserId = option.projectId.userId._id;
        const businessWalletRes = await ledgerService.getWallet(businessUserId, WALLET_TYPES.BUSINESS);
        if (businessWalletRes.success) {
            await ledgerService.creditWallet(
                businessWalletRes.wallet._id,
                parseFloat(amount),
                `Capital Received (${option.optionType})`,
                REFERENCE_TYPES.INVESTMENT || 'INVESTMENT',
                option._id,
                { investor_id: userId },
                userId
            );
        }

        // 3. Create Investment Record
        const investment = await models.Investment.create({
            userId,
            projectId: option.projectId._id,
            capitalOptionId: option._id,
            investmentAmount: parseFloat(amount),
            investmentType: option.optionType,
            status: 'ACTIVE',
            // Specifics
            ownershipPercentage: option.optionType === 'PARTNERSHIP' ?
                (amount / option.minimumInvestment) * option.profitSharingRatio : undefined, // Simplistic calc
            // Loan specifics if needed
        });

        res.json({
            success: true,
            message: 'Investment successful',
            investment
        });

    } catch (error) {
        console.error('Invest in Capital Option error:', error);
        res.status(500).json({ success: false, message: 'Investment failed', error: error.message });
    }
};
