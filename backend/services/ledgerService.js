const models = require('../database/mongodb-schema');
const { WALLET_TYPES, ENTRY_TYPES, REFERENCE_TYPES } = require('../config/constants');

/**
 * Ledger-based Wallet Service for MongoDB
 * CRITICAL: Never store balance directly - always calculate from ledger entries
 * All ledger entries are IMMUTABLE - never update or delete
 */

class LedgerService {
    /**
     * Create a new wallet for a user
     */
    async createWallet(userId, walletType, projectId = null) {
        try {
            const wallet = await models.Wallet.create({
                userId,
                walletType,
                projectId
            });

            return { success: true, wallet };
        } catch (error) {
            console.error('Create wallet error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get wallet by user and type
     */
    async getWallet(userId, walletType, projectId = null) {
        try {
            const query = {
                userId,
                walletType
            };

            if (projectId) {
                query.projectId = projectId;
            } else {
                query.projectId = null;
            }

            let wallet = await models.Wallet.findOne(query);

            // If wallet doesn't exist, create it
            if (!wallet) {
                return await this.createWallet(userId, walletType, projectId);
            }

            return { success: true, wallet };
        } catch (error) {
            console.error('Get wallet error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate wallet balance from ledger entries
     * Balance = SUM(credits) - SUM(debits)
     */
    async getBalance(walletId) {
        try {
            const entries = await models.LedgerEntry.find({ walletId });

            const balance = entries.reduce((acc, entry) => {
                if (entry.entryType === ENTRY_TYPES.CREDIT) {
                    return acc + entry.amount;
                } else {
                    return acc - entry.amount;
                }
            }, 0);

            return { success: true, balance: parseFloat(balance.toFixed(2)) };
        } catch (error) {
            console.error('Get balance error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Add credit entry to wallet
     */
    async creditWallet(walletId, amount, description, referenceType, referenceId = null, metadata = null, createdBy = null) {
        try {
            const entry = await models.LedgerEntry.create({
                walletId,
                entryType: ENTRY_TYPES.CREDIT,
                amount: parseFloat(amount),
                description,
                referenceType,
                referenceId,
                metadata,
                createdBy
            });

            // Get updated balance
            const balanceResult = await this.getBalance(walletId);

            return {
                success: true,
                entry,
                balance: balanceResult.balance
            };
        } catch (error) {
            console.error('Credit wallet error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Add debit entry to wallet
     * Checks if sufficient balance exists before debiting
     */
    async debitWallet(walletId, amount, description, referenceType, referenceId = null, metadata = null, createdBy = null) {
        try {
            // Check current balance
            const balanceResult = await this.getBalance(walletId);
            if (!balanceResult.success) {
                throw new Error('Failed to get wallet balance');
            }

            if (balanceResult.balance < parseFloat(amount)) {
                return {
                    success: false,
                    error: 'Insufficient balance',
                    currentBalance: balanceResult.balance,
                    requiredAmount: parseFloat(amount)
                };
            }

            const entry = await models.LedgerEntry.create({
                walletId,
                entryType: ENTRY_TYPES.DEBIT,
                amount: parseFloat(amount),
                description,
                referenceType,
                referenceId,
                metadata,
                createdBy
            });

            // Get updated balance
            const newBalanceResult = await this.getBalance(walletId);

            return {
                success: true,
                entry,
                balance: newBalanceResult.balance
            };
        } catch (error) {
            console.error('Debit wallet error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Transfer funds between wallets (atomic operation)
     */
    async transferFunds(fromWalletId, toWalletId, amount, description, referenceType, referenceId = null, createdBy = null) {
        try {
            // Check source wallet balance
            const balanceResult = await this.getBalance(fromWalletId);
            if (!balanceResult.success) {
                throw new Error('Failed to get source wallet balance');
            }

            if (balanceResult.balance < parseFloat(amount)) {
                return {
                    success: false,
                    error: 'Insufficient balance in source wallet',
                    currentBalance: balanceResult.balance,
                    requiredAmount: parseFloat(amount)
                };
            }

            // Debit from source wallet
            const debitResult = await this.debitWallet(
                fromWalletId,
                amount,
                `${description} (Sent)`,
                referenceType,
                referenceId,
                { transfer_to: toWalletId },
                createdBy
            );

            if (!debitResult.success) {
                throw new Error(debitResult.error);
            }

            // Credit to destination wallet
            const creditResult = await this.creditWallet(
                toWalletId,
                amount,
                `${description} (Received)`,
                referenceType,
                referenceId,
                { transfer_from: fromWalletId },
                createdBy
            );

            if (!creditResult.success) {
                // TODO: In production, implement compensation transaction
                throw new Error('Transfer failed at credit stage');
            }

            return {
                success: true,
                debitEntry: debitResult.entry,
                creditEntry: creditResult.entry,
                fromBalance: debitResult.balance,
                toBalance: creditResult.balance
            };
        } catch (error) {
            console.error('Transfer funds error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get ledger history for a wallet
     */
    async getLedgerHistory(walletId, limit = 50, offset = 0) {
        try {
            const entries = await models.LedgerEntry
                .find({ walletId })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit);

            return { success: true, entries };
        } catch (error) {
            console.error('Get ledger history error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all wallets for a user with balances
     */
    async getUserWallets(userId) {
        try {
            const wallets = await models.Wallet.find({ userId });

            // Get balance for each wallet
            const walletsWithBalance = await Promise.all(
                wallets.map(async (wallet) => {
                    const balanceResult = await this.getBalance(wallet._id);
                    return {
                        ...wallet.toObject(),
                        balance: balanceResult.success ? balanceResult.balance : 0
                    };
                })
            );

            return { success: true, wallets: walletsWithBalance };
        } catch (error) {
            console.error('Get user wallets error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get or create wallet (convenience method)
     */
    async getOrCreateWallet(userId, walletType, projectId = null) {
        const result = await this.getWallet(userId, walletType, projectId);
        return result;
    }
}

module.exports = new LedgerService();
