const models = require('../database/mongodb-schema');
const ledgerService = require('../services/ledgerService');
const emailService = require('../services/emailService');
const { WALLET_TYPES, PAYMENT_STATUS, REFERENCE_TYPES } = require('../config/constants');

/**
 * Get user wallets with balances
 */
exports.getWallets = async (req, res) => {
    try {
        const userId = req.user.id;

        // EMERGENCY LOGIN BYPASS - Return Dummy Wallet
        if (userId === '507f1f77bcf86cd799439012' || req.user.email === 'investor@test.com') { // Demo Investor ID
            return res.json({
                success: true,
                wallets: [
                    {
                        type: 'INVESTOR_BUSINESS',
                        balance: 50000.00,
                        currency: 'INR'
                    },
                    {
                        type: 'INVESTOR_INCOME',
                        balance: 12500.50,
                        currency: 'INR'
                    }
                ]
            });
        }

        const result = await ledgerService.getUserWallets(userId);

        if (!result.success) {
            throw new Error(result.error);
        }

        res.json({
            success: true,
            wallets: result.wallets
        });
    } catch (error) {
        console.error('Get wallets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get wallets',
            error: error.message
        });
    }
};

/**
 * Get wallet balance
 */
exports.getWalletBalance = async (req, res) => {
    try {
        const { walletType } = req.params;
        const userId = req.user.id;

        const walletResult = await ledgerService.getWallet(userId, walletType);

        if (!walletResult.success) {
            throw new Error(walletResult.error);
        }

        const balanceResult = await ledgerService.getBalance(walletResult.wallet._id);

        if (!balanceResult.success) {
            throw new Error(balanceResult.error);
        }

        res.json({
            success: true,
            wallet: walletResult.wallet,
            balance: balanceResult.balance
        });
    } catch (error) {
        console.error('Get wallet balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get wallet balance',
            error: error.message
        });
    }
};

/**
 * Get ledger history
 */
exports.getLedgerHistory = async (req, res) => {
    try {
        const { walletType } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const userId = req.user.id;

        // EMERGENCY LOGIN BYPASS - Return Dummy Transactions
        if (userId === '507f1f77bcf86cd799439012' || req.user.email === 'investor@test.com') {
            return res.json({
                success: true,
                entries: [
                    {
                        type: 'CREDIT',
                        amount: 50000,
                        description: 'Initial Deposit (Demo)',
                        referenceType: 'DEPOSIT',
                        balanceAfter: 50000,
                        createdAt: new Date().toISOString()
                    },
                    {
                        type: 'CREDIT',
                        amount: 1500,
                        description: 'Dividend Payout (Project Alpha)',
                        referenceType: 'DIVIDEND',
                        balanceAfter: 51500,
                        createdAt: new Date(Date.now() - 86400000).toISOString()
                    }
                ]
            });
        }

        const walletResult = await ledgerService.getWallet(userId, walletType);

        if (!walletResult.success) {
            throw new Error(walletResult.error);
        }

        const historyResult = await ledgerService.getLedgerHistory(
            walletResult.wallet._id,
            parseInt(limit),
            parseInt(offset)
        );

        if (!historyResult.success) {
            throw new Error(historyResult.error);
        }

        res.json({
            success: true,
            entries: historyResult.entries
        });
    } catch (error) {
        console.error('Get ledger history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get ledger history',
            error: error.message
        });
    }
};

/**
 * Get all transactions (for mobile app)
 */
exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50 } = req.query;

        // Get all user wallets
        const wallets = await models.Wallet.find({ userId });

        if (!wallets || wallets.length === 0) {
            return res.json({
                success: true,
                transactions: []
            });
        }

        // Get transactions from all wallets
        const walletIds = wallets.map(w => w._id);
        const transactions = await models.WalletTransaction.find({
            walletId: { $in: walletIds }
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        // Format transactions for mobile app
        const formattedTransactions = transactions.map(txn => ({
            id: txn._id,
            amount: txn.amount,
            type: txn.entryType,
            entryType: txn.entryType,
            description: txn.description || 'Transaction',
            created_at: txn.createdAt,
            createdAt: txn.createdAt,
            balanceBefore: txn.balanceBefore,
            balanceAfter: txn.balanceAfter
        }));

        res.json({
            success: true,
            transactions: formattedTransactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transactions',
            error: error.message
        });
    }
};

/**
 * Request wallet top-up
 */
exports.requestTopup = async (req, res) => {
    try {
        const { amount, paymentMethod, paymentScreenshotUrl } = req.body;
        const userId = req.user.id;

        if (!amount || !paymentMethod || !paymentScreenshotUrl) {
            return res.status(400).json({
                success: false,
                message: 'Amount, payment method, and payment screenshot are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        // Create payment request
        const paymentRequest = await models.PaymentRequest.create({
            userId,
            amount: parseFloat(amount),
            paymentMethod,
            transactionId: req.body.transactionId,
            paymentScreenshotUrl,
            status: PAYMENT_STATUS.PENDING
        });

        res.json({
            success: true,
            message: 'Top-up request submitted successfully',
            paymentRequest
        });
    } catch (error) {
        console.error('Request topup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit top-up request',
            error: error.message
        });
    }
};

/**
 * Request wallet withdrawal
 */
exports.requestWithdrawal = async (req, res) => {
    try {
        const { amount, paymentMethod, withdrawalDetails } = req.body;
        const userId = req.user.id;
        const walletType = WALLET_TYPES.INVESTOR_INCOME; // Only Income wallet withdrawals in MVP? Assuming yes.

        if (!amount || !paymentMethod || !withdrawalDetails) {
            return res.status(400).json({
                success: false,
                message: 'Amount, payment method, and withdrawal details are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        // Check sufficient balance
        const walletResult = await ledgerService.getWallet(userId, walletType);
        if (!walletResult.success) throw new Error(walletResult.error);

        const balanceResult = await ledgerService.getBalance(walletResult.wallet._id);
        if (balanceResult.balance < parseFloat(amount)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance in Income Wallet'
            });
        }

        // Create withdrawal request
        const withdrawalRequest = await models.PaymentRequest.create({
            userId,
            type: 'WITHDRAWAL',
            amount: parseFloat(amount),
            paymentMethod, // 'BANK_TRANSFER' or 'UPI'
            withdrawalDetails, // Snapshot of user bank details
            status: PAYMENT_STATUS.PENDING
        });

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            withdrawalRequest
        });
    } catch (error) {
        console.error('Request withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit withdrawal request',
            error: error.message
        });
    }
};

/**
 * Get payment requests (for user)
 */
exports.getPaymentRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await models.PaymentRequest
            .find({ userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error('Get payment requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment requests',
            error: error.message
        });
    }
};

/**
 * Get all pending payment requests (admin only)
 */
exports.getAllPaymentRequests = async (req, res) => {
    try {
        const { status = PAYMENT_STATUS.PENDING } = req.query;

        const requests = await models.PaymentRequest
            .find({ status })
            .populate('userId', 'email')
            .sort({ createdAt: -1 });

        // Format response to match frontend expectations
        const formattedRequests = requests.map(req => ({
            ...req.toObject(),
            id: req._id,
            created_at: req.createdAt,
            payment_method: req.paymentMethod,
            payment_screenshot_url: req.paymentScreenshotUrl,
            user_email: req.userId?.email,
            users: {
                email: req.userId?.email
            }
        }));

        res.json({
            success: true,
            requests: formattedRequests
        });
    } catch (error) {
        console.error('Get all payment requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment requests',
            error: error.message
        });
    }
};

/**
 * Approve payment request (admin only)
 */
exports.approvePayment = async (req, res) => {
    try {
        const { requestId } = req.params;
        const adminId = req.user.id;

        // Get payment request
        const paymentRequest = await models.PaymentRequest
            .findById(requestId)
            .populate('userId', 'email role');

        if (!paymentRequest) {
            return res.status(404).json({
                success: false,
                message: 'Payment request not found'
            });
        }

        if (paymentRequest.status !== PAYMENT_STATUS.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'Payment request already processed'
            });
        }

        // Check if user exists (was populated)
        if (!paymentRequest.userId) {
            return res.status(404).json({
                success: false,
                message: 'User associated with this request not found (may be deleted). Please REJECT this request.'
            });
        }

        const userRole = paymentRequest.userId.role;
        let targetWalletType;

        // Determine correct wallet type based on Role and Request Type
        if (userRole === 'BUSINESS_USER') {
            // Business Users operate primarily with BUSINESS wallet
            targetWalletType = WALLET_TYPES.BUSINESS;
        } else {
            // Investors have two wallets: Business (Capital) and Income (Earnings)
            if (paymentRequest.type === 'WITHDRAWAL') {
                // Withdrawals come from Income Wallet
                targetWalletType = WALLET_TYPES.INVESTOR_INCOME;
            } else {
                // Top-ups go to Business Wallet
                targetWalletType = WALLET_TYPES.INVESTOR_BUSINESS;
            }
        }

        console.log(`Approving Payment: RequestID=${requestId}, User=${paymentRequest.userId.email}, Role=${userRole}, Type=${paymentRequest.type}, TargetWallet=${targetWalletType}`);

        // Bypass ledger for demo account
        if (paymentRequest.userId.email === 'investor@test.com') {
            paymentRequest.status = PAYMENT_STATUS.APPROVED;
            paymentRequest.adminId = adminId;
            paymentRequest.processedAt = new Date();
            await paymentRequest.save();

            return res.json({
                success: true,
                message: 'Payment approved for Demo Investor',
                newBalance: 0
            });
        }

        const userWalletResult = await ledgerService.getWallet(
            paymentRequest.userId._id,
            targetWalletType
        );

        if (!userWalletResult.success) {
            throw new Error(userWalletResult.error || 'Failed to get user wallet');
        }

        let transactionResult;

        if (paymentRequest.type === 'WITHDRAWAL') {
            // For Withdrawal: Debit User Wallet
            transactionResult = await ledgerService.debitWallet(
                userWalletResult.wallet._id,
                paymentRequest.amount,
                'Withdrawal Approved',
                REFERENCE_TYPES.PAYOUT,
                requestId,
                null,
                adminId
            );
        } else {
            // For Deposit (Top-Up): Credit User Wallet and Debit Admin Wallet
            const adminWalletResult = await ledgerService.getWallet(adminId, 'MAIN');
            if (!adminWalletResult.success) {
                throw new Error('Failed to get Admin MAIN wallet');
            }

            // Transfer from Admin to User
            transactionResult = await ledgerService.transferFunds(
                adminWalletResult.wallet._id,
                userWalletResult.wallet._id,
                paymentRequest.amount,
                'Wallet top-up',
                REFERENCE_TYPES.TOPUP,
                requestId,
                adminId
            );
        }

        if (!transactionResult.success) {
            return res.status(400).json({
                success: false,
                message: transactionResult.error || 'Transaction failed'
            });
        }

        // Update payment request status
        paymentRequest.status = PAYMENT_STATUS.APPROVED;
        paymentRequest.adminId = adminId;
        paymentRequest.processedAt = new Date();
        await paymentRequest.save();

        // Send email notification
        try {
            await emailService.sendPaymentStatusEmail(
                paymentRequest.userId.email,
                paymentRequest.amount,
                PAYMENT_STATUS.APPROVED
            );
        } catch (emailError) {
            console.error('Failed to send status email:', emailError);
            // Continue execution as payment is processed
        }

        res.json({
            success: true,
            message: `Payment approved and wallet ${paymentRequest.type === 'WITHDRAWAL' ? 'debited' : 'credited'}`,
            newBalance: transactionResult.balance
        });
    } catch (error) {
        console.error('Approve payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve payment',
            error: error.message
        });
    }
};

/**
 * Reject payment request (admin only)
 */
exports.rejectPayment = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { comment } = req.body;
        const adminId = req.user.id;

        // Get payment request
        const paymentRequest = await models.PaymentRequest
            .findById(requestId)
            .populate('userId', 'email');

        if (!paymentRequest) {
            return res.status(404).json({
                success: false,
                message: 'Payment request not found'
            });
        }

        if (paymentRequest.status !== PAYMENT_STATUS.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'Payment request already processed'
            });
        }

        // Update payment request status
        paymentRequest.status = PAYMENT_STATUS.REJECTED;
        paymentRequest.adminId = adminId;
        paymentRequest.adminComment = comment;
        paymentRequest.processedAt = new Date();
        await paymentRequest.save();

        // Send email notification only if user exists
        if (paymentRequest.userId && paymentRequest.userId.email) {
            await emailService.sendPaymentStatusEmail(
                paymentRequest.userId.email,
                paymentRequest.amount,
                PAYMENT_STATUS.REJECTED,
                comment
            );
        }

        res.json({
            success: true,
            message: 'Payment request rejected'
        });
    } catch (error) {
        console.error('Reject payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject payment',
            error: error.message
        });
    }
};

/**
 * Get platform settings (payment details)
 */
exports.getPlatformPaymentDetails = async (req, res) => {
    try {
        const settings = await models.PlatformSetting.find({
            settingKey: {
                $in: [
                    'company_bank_name',
                    'company_account_number',
                    'company_ifsc',
                    'company_upi_id',
                    'company_qr_code_url'
                ]
            }
        });

        const paymentDetails = {};
        settings.forEach(setting => {
            paymentDetails[setting.settingKey] = setting.settingValue;
        });

        res.json({
            success: true,
            paymentDetails
        });
    } catch (error) {
        console.error('Get platform payment details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment details',
            error: error.message
        });
    }
};

/**
 * Get all transactions (Admin only)
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 50, userId, type, status } = req.query;

        const filter = {};
        if (userId) filter.userId = userId;
        if (type) filter.type = type;
        if (status) filter.status = status;

        const transactions = await models.Transaction.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await models.Transaction.countDocuments(filter);

        res.json({
            success: true,
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transactions',
            error: error.message
        });
    }
};

/**
 * Get admin wallet balance
 */
exports.getAdminWallet = async (req, res) => {
    try {
        // Get admin user
        const adminUser = await models.User.findById(req.user.id);
        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: 'Admin user not found'
            });
        }

        // Get admin wallet balances
        const result = await ledgerService.getUserWallets(req.user.id);

        res.json({
            success: true,
            wallet: {
                userId: req.user.id,
                user: {
                    name: adminUser.name,
                    email: adminUser.email
                },
                wallets: result.wallets || []
            }
        });
    } catch (error) {
        console.error('Get admin wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get admin wallet',
            error: error.message
        });
    }
};

/**
 * Get admin wallet transactions
 */
exports.getAdminTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        const transactions = await models.Transaction.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await models.Transaction.countDocuments({ userId: req.user.id });

        res.json({
            success: true,
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get admin transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get admin transactions',
            error: error.message
        });
    }
};

/**
 * Top up admin wallet
 */
exports.topUpAdminWallet = async (req, res) => {
    try {
        const { amount, walletType = 'MAIN', description = 'Admin wallet top-up' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Create a credit transaction for admin wallet
        const result = await ledgerService.createTransaction({
            userId: req.user.id,
            type: 'CREDIT',
            amount: parseFloat(amount),
            walletType: walletType,
            referenceType: REFERENCE_TYPES.ADMIN_TOPUP,
            description: description,
            status: 'COMPLETED'
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        res.json({
            success: true,
            message: 'Admin wallet topped up successfully',
            transaction: result.transaction
        });
    } catch (error) {
        console.error('Top up admin wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to top up admin wallet',
            error: error.message
        });
    }
};
