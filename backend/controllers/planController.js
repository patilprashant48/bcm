const models = require('../database/mongodb-schema');
const ledgerService = require('../services/ledgerService');
const { WALLET_TYPES, REFERENCE_TYPES, ROLES } = require('../config/constants');

/**
 * Get all available subscription plans
 */
exports.getPlans = async (req, res) => {
    try {
        // Return only active plans for business users
        // Admin might see all, but this endpoint is public
        const plans = await models.Plan.find({ isActive: true }).sort({ price: 1 });

        // Map to frontend expected format if needed, but schema seems aligned
        // Frontend expects: id, plan_name, price, validity_days, max_projects, features
        // Schema: planName, price, validityDays, maxProjects, features
        const formattedPlans = plans.map(p => ({
            id: p._id,
            plan_name: p.planName,
            price: p.price,
            validity_days: p.validityDays,
            max_projects: p.maxProjects,
            features: p.features,
            description: p.description
        }));

        res.json({
            success: true,
            plans: formattedPlans
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch plans', error: error.message });
    }
};

/**
 * Activate a plan for the logged-in user
 */
exports.activatePlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const userId = req.user.id;

        const plan = await models.Plan.findById(planId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({ success: false, message: 'Plan not found or inactive' });
        }

        // Check if user already has an active plan
        const currentPlan = await models.UserPlan.findOne({
            userId,
            status: 'ACTIVE',
            expiryDate: { $gt: new Date() }
        });

        if (currentPlan) {
            // Options: Upgrade? Extend? 
            // For MVP, blocking multiple active plans
            return res.status(400).json({ success: false, message: 'You already have an active plan' });
        }

        // Check Wallet Balance
        const walletRes = await ledgerService.getWallet(userId, WALLET_TYPES.BUSINESS);
        if (!walletRes.success) throw new Error(walletRes.error);

        const balanceRes = await ledgerService.getBalance(walletRes.wallet._id);
        if (balanceRes.balance < plan.price) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance. Please top up.' });
        }

        // Debit Wallet
        const debitRes = await ledgerService.debitWallet(
            walletRes.wallet._id,
            plan.price,
            `Plan Activation: ${plan.planName}`,
            REFERENCE_TYPES.SUBSCRIPTION || 'SUBSCRIPTION',
            plan._id,
            { plan_id: plan._id, validity: plan.validityDays },
            userId // Admin ID usually here if admin action, but system action? Or user action. Usually null or passed user ID if user initiated?
            // ledgerService expects adminId for audit. Let's pass userId as actor.
        );

        if (!debitRes.success) {
            return res.status(500).json({ success: false, message: 'Transaction failed', error: debitRes.error });
        }

        // Create UserPlan
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + plan.validityDays);

        const userPlan = await models.UserPlan.create({
            userId,
            planId: plan._id,
            startDate: new Date(),
            expiryDate,
            status: 'ACTIVE',
            // paymentId? Maybe track transaction ID
        });

        res.json({
            success: true,
            message: 'Plan activated successfully',
            userPlan
        });

    } catch (error) {
        console.error('Activate plan error:', error);
        res.status(500).json({ success: false, message: 'Failed to activate plan', error: error.message });
    }
};

/**
 * Get active plan for the logged-in user
 */
exports.getActivePlan = async (req, res) => {
    try {
        const userId = req.user.id;

        const userPlan = await models.UserPlan.findOne({
            userId,
            status: 'ACTIVE',
            expiryDate: { $gt: new Date() }
        }).populate('planId');

        if (!userPlan) {
            return res.json({ success: true, plan: null });
        }

        // Format for frontend
        const plan = userPlan.planId;
        res.json({
            success: true,
            plan: {
                user_plan_id: userPlan._id,
                plan_id: plan._id,
                plan_name: plan.planName,
                price: plan.price,
                start_date: userPlan.startDate,
                expiry_date: userPlan.expiryDate,
                projects_remaining: plan.maxProjects, // Should track usage? For now static max.
                // To track usage, we need to count projects created during plan period.
                // Assuming simple static display for now.
                features: plan.features
            }
        });

    } catch (error) {
        console.error('Get active plan error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch active plan', error: error.message });
    }
};
