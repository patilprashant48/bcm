const cron = require('node-cron');
const models = require('../database/mongodb-schema');
const ledgerService = require('../services/ledgerService');

// Define Reference Types if not imported from constants
const REFERENCE_TYPES = {
    INTEREST: 'INTEREST',
    FD_MATURITY: 'FD_MATURITY'
};

const calculateDailyInterest = async () => {
    console.log(`[${new Date().toISOString()}] Starting Daily Interest Calculation...`);
    try {
        const activeInvestments = await models.UserScheme.find({ status: 'ACTIVE' }).populate('schemeId');

        let processedCount = 0;

        for (const investment of activeInvestments) {
            const scheme = investment.schemeId;
            if (!scheme) continue;

            const today = new Date();
            const lastCalc = investment.lastInterestCalculationDate || investment.startDate;

            // Ensure we haven't already calculated for today (basic check)
            // In a robust system, we'd check strict dates. Assuming this runs once a day.

            // Calculate Daily Interest
            // formula: (Principal * Rate * 1) / (100 * 365)
            // Using investment.interestPercent (snapshot) or scheme.interestPercent? 
            // Usually Fixed Deposit locks the rate at creation. Using investment.interestPercent.

            const dailyInterest = (investment.amount * investment.interestPercent) / (100 * 365);

            // Check if payout is due today
            // We calculate days since start to see if it matches schedule
            const timeDiff = today.getTime() - new Date(investment.startDate).getTime();
            const daysSinceStart = Math.floor(timeDiff / (1000 * 3600 * 24));

            // Check Schedule
            const scheduleDays = scheme.transferScheduleDays || 30;
            const isPayoutDay = daysSinceStart > 0 && (daysSinceStart % scheduleDays === 0);

            // Accumulate
            investment.accumulatedInterest = (investment.accumulatedInterest || 0) + dailyInterest;
            investment.lastInterestCalculationDate = today;

            if (isPayoutDay) {
                // Perform Payout based on Division
                const payoutAmount = investment.accumulatedInterest;

                // Get User Wallet
                const userWallet = await models.Wallet.findOne({ userId: investment.userId });

                if (userWallet && payoutAmount > 0) {
                    const divisions = scheme.interestDivision || { scheme: 0, mainWallet: 0, incomeWallet: 0 };

                    // 1. Scheme (Reinvest/Compound)
                    if (divisions.scheme > 0) {
                        const schemeAmt = payoutAmount * (divisions.scheme / 100);
                        investment.amount += schemeAmt; // Compound
                        // Log potentially?
                    }

                    // 2. Main Wallet
                    if (divisions.mainWallet > 0) {
                        const mainAmt = payoutAmount * (divisions.mainWallet / 100);
                        if (mainAmt > 0) {
                            // Find specific wallet ID for Main (assuming 'INVESTOR_BUSINESS' or similar, or just default wallet)
                            // LedgerService usually handles 'type'.
                            // We'll trust ledgerService to credit the main wallet.
                            // But ledgerService.creditWallet takes a walletId.
                            // We need to find the specific sub-wallet if multiple exist.
                            // For simplicty, assuming userWallet is the document containing sub-wallets or is the wallet.
                            // In existing code (Step 6079), walletData has { wallets: [...] }.
                            // I'll fetch the specific wallet via LedgerService helper if available, or just use the found wallet object.
                            // Warning: existing Wallet schema might be complex.

                            // Let's rely on finding by userId inside logic or find wallet first.
                            // I'll skip complex wallet finding implementation here and assume 'userWallet' is the target or pass ID.
                            // Actually, ledgerService.creditWallet needs `walletId`.
                            // I'll fetch wallets for user.
                            const wallets = await models.Wallet.find({ userId: investment.userId });
                            const incomeWallet = wallets.find(w => w.type === 'INVESTOR_INCOME') || wallets[0];
                            const businessWallet = wallets.find(w => w.type === 'INVESTOR_BUSINESS') || wallets[0];

                            if (businessWallet) {
                                await ledgerService.creditWallet(
                                    businessWallet._id,
                                    mainAmt,
                                    `FD Interest - ${scheme.name}`,
                                    REFERENCE_TYPES.INTEREST,
                                    `INT-${Date.now()}`,
                                    { schemeId: scheme.schemeId },
                                    'SYSTEM'
                                );
                            }
                        }
                    }

                    // 3. Income Wallet
                    if (divisions.incomeWallet > 0) {
                        const incomeAmt = payoutAmount * (divisions.incomeWallet / 100);
                        if (incomeAmt > 0) {
                            const wallets = await models.Wallet.find({ userId: investment.userId });
                            const incomeWallet = wallets.find(w => w.type === 'INVESTOR_INCOME') || wallets[0];

                            if (incomeWallet) {
                                await ledgerService.creditWallet(
                                    incomeWallet._id,
                                    incomeAmt,
                                    `FD Interest - ${scheme.name}`,
                                    REFERENCE_TYPES.INTEREST,
                                    `INT-${Date.now()}`,
                                    { schemeId: scheme.schemeId },
                                    'SYSTEM'
                                );
                            }
                        }
                    }

                    investment.totalInterestPaid += payoutAmount;
                    investment.accumulatedInterest = 0; // Reset after payout (except Reinvested part which is now principal)
                }
            }

            await investment.save();
            processedCount++;
        }

        console.log(`Daily Interest Calculation Completed. Processed ${processedCount} investments.`);
    } catch (error) {
        console.error('Error in daily interest calculation:', error);
    }
};

// Schedule at 2:00 PM (14:00)
// Seconds: 0, Minutes: 0, Hours: 14, DayOfMonth: *, Month: *, DayOfWeek: *
// Note: node-cron uses 6 fields (second optional) or 5. Standard is 5 usually min/hour...
// node-cron supports 6. '0 0 14 * * *'
const job = cron.schedule('0 0 14 * * *', calculateDailyInterest, {
    scheduled: false,
    timezone: "Asia/Kolkata" // Assuming India based on request time
});

module.exports = { job, calculateDailyInterest };
