const cron = require('node-cron');
const models = require('../database/mongodb-schema');
const ledgerService = require('../services/ledgerService');
const { WALLET_TYPES, REFERENCE_TYPES, ROLES } = require('../config/constants');

const calculateDailyInterest = async () => {
    console.log(`[${new Date().toISOString()}] Starting Daily Interest & Maturity Calculation...`);
    try {
        // Fetch ACTIVE investments and populate Scheme + Creator to know who pays
        const activeInvestments = await models.UserScheme.find({ status: 'ACTIVE' })
            .populate({
                path: 'schemeId',
                populate: { path: 'createdBy' } // Need creator to debit them
            });

        let processedCount = 0;
        let maturedCount = 0;

        for (const investment of activeInvestments) {
            const scheme = investment.schemeId;
            if (!scheme) continue;

            const today = new Date();

            // --- 1. MATURITY CHECK ---
            if (new Date(investment.maturityDate) <= today) {
                // Investment Matured
                console.log(`Processing Maturity for Investment: ${investment._id}`);

                // Calculate Payout: Principal + Accumulated Interest
                // Note: We assume daily interest for today is negligible or calculated previously. 
                // For precision, one might calc interest up to exact maturity date. 
                // Let's settle accumulated interest + Principal.

                const totalPayout = investment.amount + (investment.accumulatedInterest || 0);

                // Identify Payer (Business User) and Payee (Investor)
                const businessUserId = scheme.createdBy?._id;
                const investorId = investment.userId;

                // 1. Debit Business User (if exists)
                if (businessUserId) {
                    const businessWalletRes = await ledgerService.getWallet(businessUserId, WALLET_TYPES.BUSINESS);
                    if (businessWalletRes.success) {
                        await ledgerService.debitWallet(
                            businessWalletRes.wallet._id,
                            totalPayout,
                            `FD Maturity Payout: ${scheme.name}`,
                            REFERENCE_TYPES.PAYOUT || 'PAYOUT',
                            investment._id,
                            { investor_id: investorId },
                            'SYSTEM'
                        );
                    }
                }

                // 2. Credit Investor Income Wallet (As per requirement)
                const investorWalletRes = await ledgerService.getWallet(investorId, WALLET_TYPES.INVESTOR_INCOME);
                if (investorWalletRes.success) {
                    await ledgerService.creditWallet(
                        investorWalletRes.wallet._id,
                        totalPayout,
                        `FD Maturity Credit: ${scheme.name}`,
                        REFERENCE_TYPES.PAYOUT || 'PAYOUT',
                        investment._id,
                        { scheme_id: scheme.schemeId },
                        'SYSTEM'
                    );
                }

                // 3. Mark Matured
                investment.status = 'MATURED';
                investment.totalInterestPaid += investment.accumulatedInterest;
                investment.accumulatedInterest = 0;
                await investment.save();

                maturedCount++;
                continue; // Skip daily calc for this matured investment
            }

            // --- 2. DAILY INTEREST CALCULATION ---

            // Calculate Daily Interest: (Principal * Rate) / (100 * 365)
            const dailyInterest = (investment.amount * investment.interestPercent) / (100 * 365);

            // Accumulate
            investment.accumulatedInterest = (investment.accumulatedInterest || 0) + dailyInterest;
            investment.lastInterestCalculationDate = today;

            // --- 3. SCHEDULED INTEREST PAYOUT (Non-Maturity) ---
            // Only if scheme has periodic transfer enabled
            // Check days since start
            const timeDiff = today.getTime() - new Date(investment.startDate).getTime();
            const daysSinceStart = Math.floor(timeDiff / (1000 * 3600 * 24));
            const scheduleDays = scheme.transferScheduleDays || 30; // Default 30

            // Logic: If periodic payout is enabled (some schemes might only pay at maturity)
            // Checking if interestTransferType implies periodic. 
            // If interestTransferType is empty or only triggers at maturity, skip this.
            // Assuming 'transferScheduleDays' implies intent.

            if (daysSinceStart > 0 && (daysSinceStart % scheduleDays === 0)) {
                const payoutAmount = investment.accumulatedInterest;
                if (payoutAmount > 0) {
                    // Payout Logic: Credit Investor (Debiting Business User implicitly tracked via accumulated interest liability?)
                    // Usually periodic interest is also paid by Business User.
                    // For MVP, we credit Investor Income Wallet.
                    // We SHOULD debit Business User here too.

                    const businessUserId = scheme.createdBy?._id;
                    const investorId = investment.userId;

                    // Debit Business
                    if (businessUserId) {
                        const bwRes = await ledgerService.getWallet(businessUserId, WALLET_TYPES.BUSINESS);
                        if (bwRes.success) {
                            await ledgerService.debitWallet(
                                bwRes.wallet._id,
                                payoutAmount,
                                `Periodic FD Interest: ${scheme.name}`,
                                REFERENCE_TYPES.INTEREST || 'INTEREST',
                                investment._id,
                                null,
                                'SYSTEM'
                            );
                        }
                    }

                    // Credit Investor (Income Wallet usually)
                    const iwRes = await ledgerService.getWallet(investorId, WALLET_TYPES.INVESTOR_INCOME);
                    if (iwRes.success) {
                        await ledgerService.creditWallet(
                            iwRes.wallet._id,
                            payoutAmount,
                            `Periodic FD Interest: ${scheme.name}`,
                            REFERENCE_TYPES.INTEREST || 'INTEREST',
                            investment._id,
                            null,
                            'SYSTEM'
                        );
                    }

                    investment.totalInterestPaid += payoutAmount;
                    investment.accumulatedInterest = 0; // Reset
                }
            }

            await investment.save();
            processedCount++;
        }

        console.log(`Daily Interest Calculation Completed. Processed: ${processedCount}, Matured: ${maturedCount}`);
    } catch (error) {
        console.error('Error in daily interest calculation:', error);
    }
};

// Schedule at 2:00 PM (14:00) IST
const job = cron.schedule('0 0 14 * * *', calculateDailyInterest, {
    scheduled: false,
    timezone: "Asia/Kolkata"
});

module.exports = { job, calculateDailyInterest };
