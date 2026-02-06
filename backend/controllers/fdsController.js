const models = require('../database/mongodb-schema');
const ledgerService = require('../services/ledgerService');
const { WALLET_TYPES, REFERENCE_TYPES, ROLES } = require('../config/constants');

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

        const userId = req.user.id;
        const role = req.user.role;

        // Determine initial status
        // Admin -> APPROVED, Business -> PENDING
        const approvalStatus = role === ROLES.ADMIN ? 'APPROVED' : 'PENDING';

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
            createdBy: userId,
            approvalStatus: approvalStatus,
            isActive: true, // Internal active flag, but public visibility depends on isPublished
            isPublished: false
        });

        res.json({
            success: true,
            message: role === ROLES.ADMIN ? 'Scheme created successfully' : 'Scheme submitted for approval',
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
        const schemes = await models.FDScheme.find()
            .populate('createdBy', 'email role')
            .sort({ createdAt: -1 });

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
 * Approve/Reject FDS Scheme
 */
exports.manageSchemeApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body; // status: APPROVED, REJECTED, RECHECK

        if (!['APPROVED', 'REJECTED', 'RECHECK'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const scheme = await models.FDScheme.findById(id);
        if (!scheme) {
            return res.status(404).json({ success: false, message: 'Scheme not found' });
        }

        scheme.approvalStatus = status;
        if (comments) scheme.adminComments = comments;

        // If approved, you might want to auto-publish or leave it manual
        // For flow simplicity: Approved = Eligible to be Published

        await scheme.save();

        res.json({
            success: true,
            message: `Scheme ${status.toLowerCase()}`,
            scheme
        });
    } catch (error) {
        console.error('Manage Scheme Approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update approval status',
            error: error.message
        });
    }
};

/**
 * Get Active & Published Schemes (For Investors)
 */
exports.getActiveSchemes = async (req, res) => {
    try {
        const schemes = await models.FDScheme.find({
            isActive: true,
            isPublished: true,
            approvalStatus: 'APPROVED'
        }).sort({ createdAt: -1 });

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
        const scheme = await models.FDScheme.findById(schemeId).populate('createdBy');
        if (!scheme || !scheme.isActive || scheme.approvalStatus !== 'APPROVED') {
            return res.status(404).json({ success: false, message: 'Scheme not found, inactive, or not approved' });
        }

        // 2. Validate Amount
        if (amount < scheme.minAmount) {
            return res.status(400).json({ success: false, message: `Minimum amount is ${scheme.minAmount}` });
        }

        // 3. Get User Wallet (Investor Business - Main Wallet)
        // Note: Assuming Investments come from 'INVESTOR_BUSINESS' (Main Wallet)
        const userWalletRes = await ledgerService.getWallet(userId, WALLET_TYPES.INVESTOR_BUSINESS);
        if (!userWalletRes.success) throw new Error('Investor wallet not found');
        const userWallet = userWalletRes.wallet;

        // 4. Debit Investor Wallet
        const debitRes = await ledgerService.debitWallet(
            userWallet._id,
            amount,
            `Investment in FD: ${scheme.name}`,
            REFERENCE_TYPES.INVESTMENT || 'INVESTMENT',
            schemeId,
            { scheme_name: scheme.name, scheme_id: scheme.schemeId },
            userId
        );

        if (!debitRes.success) {
            return res.status(400).json({ success: false, message: 'Insufficient balance or wallet error' });
        }

        // 5. Credit Business User Wallet (If scheme has a creator)
        if (scheme.createdBy) {
            // Determine Business User Wallet (BUSINESS)
            const businessWalletRes = await ledgerService.getWallet(scheme.createdBy._id, WALLET_TYPES.BUSINESS);

            if (businessWalletRes.success) {
                const businessWallet = businessWalletRes.wallet;
                await ledgerService.creditWallet(
                    businessWallet._id,
                    amount,
                    `FD Investment Received: ${scheme.name}`,
                    REFERENCE_TYPES.INVESTMENT || 'INVESTMENT',
                    schemeId,
                    { investor_id: userId, scheme_id: scheme.schemeId },
                    userId
                );
            } else {
                console.error(`Business wallet not found for user ${scheme.createdBy._id}`);
                // Edge case: Money deducted but not credited. 
                // In production, this should be a transaction. 
                // For MVP, we log and proceed (money is "with the platform" implicitly).
            }
        }

        // 6. Create UserScheme Entry
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
