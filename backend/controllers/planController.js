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

        // Map to frontend expected format
        // Schema fields: name, price, durationDays, features, isActive
        const formattedPlans = plans.map(p => ({
            id: p._id,
            plan_name: p.name,
            price: p.price,
            validity_days: p.durationDays,
            max_projects: p.maxProjects || 0,
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
            isActive: true,
            expiresAt: { $gt: new Date() }
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
            `Plan Activation: ${plan.name}`,
            'PLAN_ACTIVATION',
            plan._id,
            { plan_id: plan._id, validity: plan.durationDays },
            userId
        );

        if (!debitRes.success) {
            return res.status(500).json({ success: false, message: 'Transaction failed', error: debitRes.error });
        }

        // Credit Admin Wallet (non-blocking — don't fail activation if this errors)
        try {
            const adminUser = await models.User.findOne({ role: 'ADMIN' });
            if (adminUser) {
                const adminWalletRes = await ledgerService.getWallet(adminUser._id, 'ADMIN');
                if (adminWalletRes.success) {
                    await ledgerService.creditWallet(
                        adminWalletRes.wallet._id,
                        plan.price,
                        `Plan Activation Received: ${plan.name} by ${userId}`,
                        'PLAN_ACTIVATION',
                        plan._id,
                        { buyer_id: userId },
                        userId
                    );
                }
            }
        } catch (adminCreditErr) {
            console.error('Admin wallet credit failed (non-blocking):', adminCreditErr.message);
        }

        // Create UserPlan
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

        const userPlan = await models.UserPlan.create({
            userId,
            planId: plan._id,
            activatedAt: new Date(),
            expiresAt,
            isActive: true
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
            isActive: true,
            expiresAt: { $gt: new Date() }
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
                plan_name: plan.name,
                price: plan.price,
                start_date: userPlan.activatedAt,
                expiry_date: userPlan.expiresAt,
                projects_remaining: plan.maxProjects || 0,
                features: plan.features
            }
        });

    } catch (error) {
        console.error('Get active plan error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch active plan', error: error.message });
    }
};
