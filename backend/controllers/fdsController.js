const models = require('../database/mongodb-schema');
const ledgerService = require('../services/ledgerService');
const { WALLET_TYPES, REFERENCE_TYPES } = require('../config/constants');

/**
 * Create a new FDS Scheme
 */
exports.createScheme = async (req, res) => {
    try {
        const {
            name,
            interestPercent,
            minAmount,
            interestCalculationDays,
            interestTransferType,
            interestDivision,
            transferScheduleDays,
            maturityDays,
            maturityTransferDivision,
            taxDeductionPercent
        } = req.body;

        // Generate Scheme ID: FDS + YYYYMMDD + Random 4 digits
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        const schemeId = `FDS${date}${random}`;

        const scheme = await models.FDScheme.create({
            schemeId,
            name,
            interestPercent,
            minAmount,
            interestCalculationDays,
            interestTransferType,
            interestDivision,
            transferScheduleDays,
            maturityDays,
            maturityTransferDivision,
            taxDeductionPercent,
            isActive: true,
            isPublished: false
        });

        res.json({
            success: true,
            message: 'Scheme created successfully',
            scheme
        });
    } catch (error) {
        console.error('Create FDS Scheme error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create scheme',
            error: error.message
        });
    }
};

/**
 * Get all schemes (for admin)
 */
exports.getSchemes = async (req, res) => {
    try {
        const schemes = await models.FDScheme.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            schemes
        });
    } catch (error) {
        console.error('Get FDS Schemes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get schemes',
            error: error.message
        });
    }
};

/**
 * Toggle Scheme Status (Active/Deactivate, Publish/Unpublish)
 */
exports.updateSchemeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, isPublished } = req.body;

        const scheme = await models.FDScheme.findById(id);
        if (!scheme) {
            return res.status(404).json({ success: false, message: 'Scheme not found' });
        }

        if (isActive !== undefined) scheme.isActive = isActive;
        if (isPublished !== undefined) scheme.isPublished = isPublished;

        await scheme.save();

        res.json({
            success: true,
            message: 'Scheme status updated',
            scheme
        });
    } catch (error) {
        console.error('Update FDS Scheme status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update scheme status',
            error: error.message
        });
    }
};

/**
 * Get Active & Published Schemes (For Investors)
 */
exports.getActiveSchemes = async (req, res) => {
    try {
        const schemes = await models.FDScheme.find({ isActive: true, isPublished: true }).sort({ createdAt: -1 });
        res.json({
            success: true,
            schemes
        });
    } catch (error) {
        console.error('Get Active FDS Schemes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get active schemes',
            error: error.message
        });
    }
};

/**
 * Invest in FD Scheme
 */
exports.investInScheme = async (req, res) => {
    try {
        const { schemeId, amount } = req.body;
        const userId = req.user.id; // From Auth Middleware

        // 1. Validate Scheme
        const scheme = await models.FDScheme.findById(schemeId);
        if (!scheme || !scheme.isActive) {
            return res.status(404).json({ success: false, message: 'Scheme not found or inactive' });
        }

        // 2. Validate Amount
        if (amount < scheme.minAmount) {
            return res.status(400).json({ success: false, message: `Minimum amount is ${scheme.minAmount}` });
        }

        // 3. Get User Wallet (Investor Business - Main Wallet)
        const walletRes = await ledgerService.getWallet(userId, WALLET_TYPES.INVESTOR_BUSINESS);
        if (!walletRes.success) throw new Error('Wallet not found');
        const wallet = walletRes.wallet;

        // 4. Debit Wallet
        const debitRes = await ledgerService.debitWallet(
            wallet._id,
            amount,
            `Investment in FD: ${scheme.name}`,
            REFERENCE_TYPES.INVESTMENT || 'INVESTMENT',
            schemeId,
            { scheme_name: scheme.name },
            userId
        );

        if (!debitRes.success) {
            return res.status(400).json({ success: false, message: debitRes.error });
        }

        // 5. Create UserScheme Entry
        const maturityDate = new Date();
        maturityDate.setDate(maturityDate.getDate() + scheme.maturityDays);

        const investment = await models.UserScheme.create({
            userId,
            schemeId,
            amount,
            interestPercent: scheme.interestPercent, // Lock interest rate
            startDate: new Date(),
            maturityDate,
            status: 'ACTIVE'
        });

        res.json({
            success: true,
            message: 'Investment successful',
            investment
        });

    } catch (error) {
        console.error('Invest in Scheme error:', error);
        res.status(500).json({ success: false, message: 'Investment failed', error: error.message });
    }
};
