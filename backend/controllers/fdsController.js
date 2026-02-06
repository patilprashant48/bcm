const models = require('../database/mongodb-schema');

/**
 * Create a new FDS Scheme
 */
exports.createScheme = async (req, res) => {
    try {
        const {
            name,
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
