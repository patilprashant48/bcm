const cron = require('node-cron');
const models = require('../database/mongodb-schema');
const ledgerService = require('./ledgerService');
const emailService = require('./emailService');
const { WALLET_TYPES, REFERENCE_TYPES } = require('../config/constants');

/**
 * Automation Service - Cron Jobs for BCM Platform
 * Handles automated tasks like EMI processing, FD maturity, etc.
 */

class AutomationService {
    constructor() {
        this.jobs = [];
    }

    /**
     * Process daily EMI payments
     * Runs every day at 9:00 AM
     */
    startEMIProcessing() {
        const job = cron.schedule('0 9 * * *', async () => {
            console.log('Running EMI processing...');

            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Get all pending EMIs due today
                const pendingEMIs = await models.EmiPayment.find({
                    status: 'PENDING',
                    dueDate: { $lte: today }
                }).populate({
                    path: 'investmentId',
                    populate: [
                        { path: 'userId' },
                        { path: 'projectId', populate: { path: 'userId' } }
                    ]
                });

                for (const emi of pendingEMIs) {
                    try {
                        const investment = emi.investmentId;
                        const investor = investment.userId;
                        const business = investment.projectId.userId;

                        // Get wallets
                        const businessWalletResult = await ledgerService.getWallet(
                            business._id,
                            WALLET_TYPES.BUSINESS
                        );

                        const investorWalletResult = await ledgerService.getWallet(
                            investor._id,
                            WALLET_TYPES.INVESTOR_INCOME
                        );

                        if (!businessWalletResult.success || !investorWalletResult.success) {
                            console.error(`Failed to get wallets for EMI ${emi._id}`);
                            continue;
                        }

                        // Transfer EMI amount
                        const transferResult = await ledgerService.transferFunds(
                            businessWalletResult.wallet._id,
                            investorWalletResult.wallet._id,
                            emi.emiAmount,
                            `EMI Payment #${emi.emiNumber}`,
                            REFERENCE_TYPES.EMI,
                            emi._id,
                            business._id
                        );

                        if (transferResult.success) {
                            // Update EMI status
                            emi.status = 'PAID';
                            emi.paidDate = new Date();
                            await emi.save();

                            // Update investment
                            investment.remainingEmis -= 1;
                            if (investment.remainingEmis > 0) {
                                const nextMonth = new Date(emi.dueDate);
                                nextMonth.setMonth(nextMonth.getMonth() + 1);
                                investment.nextEmiDate = nextMonth;
                            } else {
                                investment.status = 'COMPLETED';
                            }
                            await investment.save();

                            // Send notification
                            await emailService.sendEMIReminderEmail(
                                investor.email,
                                emi.emiAmount,
                                'PAID'
                            );

                            console.log(`✓ EMI ${emi._id} processed successfully`);
                        } else {
                            console.error(`Failed to transfer EMI ${emi._id}: ${transferResult.error}`);

                            // Mark as overdue
                            emi.status = 'OVERDUE';
                            await emi.save();
                        }
                    } catch (error) {
                        console.error(`Error processing EMI ${emi._id}:`, error);
                    }
                }

                console.log(`EMI processing completed. Processed ${pendingEMIs.length} EMIs.`);
            } catch (error) {
                console.error('EMI processing error:', error);
            }
        });

        this.jobs.push(job);
        console.log('✓ EMI processing scheduled (daily 9:00 AM)');
    }

    /**
     * Process FD maturity
     * Runs every day at 10:00 AM
     */
    startFDMaturityProcessing() {
        const job = cron.schedule('0 10 * * *', async () => {
            console.log('Running FD maturity processing...');

            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Get all FDs maturing today
                const maturingFDs = await models.Investment.find({
                    investmentType: 'FD',
                    status: 'ACTIVE',
                    maturityDate: { $lte: today }
                }).populate('userId projectId');

                for (const fd of maturingFDs) {
                    try {
                        // Get investor wallet
                        const walletResult = await ledgerService.getWallet(
                            fd.userId._id,
                            WALLET_TYPES.INVESTOR_INCOME
                        );

                        if (!walletResult.success) {
                            console.error(`Failed to get wallet for FD ${fd._id}`);
                            continue;
                        }

                        // Credit maturity amount
                        const creditResult = await ledgerService.creditWallet(
                            walletResult.wallet._id,
                            fd.maturityAmount,
                            `FD Maturity - ${fd.projectId.projectName}`,
                            REFERENCE_TYPES.PAYOUT,
                            fd._id,
                            { investment_type: 'FD' }
                        );

                        if (creditResult.success) {
                            // Update FD status
                            fd.status = 'COMPLETED';
                            await fd.save();

                            // Send notification
                            await emailService.sendFDMaturityEmail(
                                fd.userId.email,
                                fd.maturityAmount,
                                fd.projectId.projectName
                            );

                            console.log(`✓ FD ${fd._id} matured successfully`);
                        }
                    } catch (error) {
                        console.error(`Error processing FD ${fd._id}:`, error);
                    }
                }

                console.log(`FD maturity processing completed. Processed ${maturingFDs.length} FDs.`);
            } catch (error) {
                console.error('FD maturity processing error:', error);
            }
        });

        this.jobs.push(job);
        console.log('✓ FD maturity processing scheduled (daily 10:00 AM)');
    }

    /**
     * Process monthly partnership payouts
     * Runs on 1st of every month at 11:00 AM
     */
    startPartnershipPayouts() {
        const job = cron.schedule('0 11 1 * *', async () => {
            console.log('Running partnership payout processing...');

            try {
                // Get all active partnerships
                const partnerships = await models.Investment.find({
                    investmentType: 'PARTNERSHIP',
                    status: 'ACTIVE'
                }).populate('userId projectId');

                for (const partnership of partnerships) {
                    try {
                        // Calculate payout (simplified - in production, use actual profit data)
                        const monthlyPayout = partnership.investmentAmount * (partnership.ownershipPercentage / 100) * 0.05; // 5% monthly return example

                        // Get investor wallet
                        const walletResult = await ledgerService.getWallet(
                            partnership.userId._id,
                            WALLET_TYPES.INVESTOR_INCOME
                        );

                        if (!walletResult.success) {
                            console.error(`Failed to get wallet for partnership ${partnership._id}`);
                            continue;
                        }

                        // Credit payout
                        const creditResult = await ledgerService.creditWallet(
                            walletResult.wallet._id,
                            monthlyPayout,
                            `Partnership Payout - ${partnership.projectId.projectName}`,
                            REFERENCE_TYPES.PAYOUT,
                            partnership._id,
                            { investment_type: 'PARTNERSHIP', month: new Date().toISOString() }
                        );

                        if (creditResult.success) {
                            // Update next payout date
                            const nextMonth = new Date();
                            nextMonth.setMonth(nextMonth.getMonth() + 1);
                            partnership.nextPayoutDate = nextMonth;
                            await partnership.save();

                            console.log(`✓ Partnership ${partnership._id} payout processed`);
                        }
                    } catch (error) {
                        console.error(`Error processing partnership ${partnership._id}:`, error);
                    }
                }

                console.log(`Partnership payout processing completed. Processed ${partnerships.length} partnerships.`);
            } catch (error) {
                console.error('Partnership payout processing error:', error);
            }
        });

        this.jobs.push(job);
        console.log('✓ Partnership payouts scheduled (monthly 1st, 11:00 AM)');
    }

    /**
     * Check and mark expired plans
     * Runs every day at midnight
     */
    startPlanExpiryCheck() {
        const job = cron.schedule('0 0 * * *', async () => {
            console.log('Running plan expiry check...');

            try {
                const today = new Date();

                // Find expired plans
                const expiredPlans = await models.UserPlan.updateMany(
                    {
                        isActive: true,
                        expiresAt: { $lt: today }
                    },
                    {
                        $set: { isActive: false }
                    }
                );

                console.log(`Plan expiry check completed. Expired ${expiredPlans.modifiedCount} plans.`);
            } catch (error) {
                console.error('Plan expiry check error:', error);
            }
        });

        this.jobs.push(job);
        console.log('✓ Plan expiry check scheduled (daily midnight)');
    }

    /**
     * Update share prices (simplified fluctuation)
     * Runs every hour
     */
    startSharePriceUpdates() {
        const job = cron.schedule('0 * * * *', async () => {
            console.log('Running share price updates...');

            try {
                // Get all approved shares
                const shares = await models.Share.find({ isApproved: true });

                for (const share of shares) {
                    try {
                        // Simple price fluctuation: ±5% random change
                        // In production, use real market data or sophisticated algorithms
                        const fluctuation = (Math.random() - 0.5) * 0.1; // -5% to +5%
                        const newPrice = share.currentPrice * (1 + fluctuation);

                        share.currentPrice = Math.max(newPrice, share.shareValue * 0.5); // Don't go below 50% of face value
                        await share.save();
                    } catch (error) {
                        console.error(`Error updating share ${share._id}:`, error);
                    }
                }

                console.log(`Share price updates completed. Updated ${shares.length} shares.`);
            } catch (error) {
                console.error('Share price update error:', error);
            }
        });

        this.jobs.push(job);
        console.log('✓ Share price updates scheduled (hourly)');
    }

    /**
     * Start all automation services
     */
    startAll() {
        console.log('\nStarting automation services...');

        this.startEMIProcessing();
        this.startFDMaturityProcessing();
        this.startPartnershipPayouts();
        this.startPlanExpiryCheck();
        this.startSharePriceUpdates();

        console.log('\n✓ All automation services started\n');
    }

    /**
     * Stop all automation services
     */
    stopAll() {
        console.log('Stopping automation services...');

        this.jobs.forEach(job => job.stop());
        this.jobs = [];

        console.log('✓ All automation services stopped');
    }
}

module.exports = new AutomationService();
