const mongoose = require('mongoose');

/**
 * MongoDB Schema for BCM Platform
 * Converted from PostgreSQL to MongoDB
 */

// =====================================================
// USER SCHEMAS
// =====================================================

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String },
    role: {
        type: String,
        enum: ['ADMIN', 'BUSINESS_USER', 'INVESTOR'],
        default: 'INVESTOR'
    },
    passwordHash: { type: String },
    passwordUpdated: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const userProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String },
    profilePhotoUrl: { type: String },
    aadhaarNumber: { type: String },
    panNumber: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const businessProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String },
    businessLogoUrl: { type: String },
    businessType: {
        type: String,
        enum: ['PROPRIETORSHIP', 'PVT_LTD', 'LIMITED', 'PARTNERSHIP', 'LLP']
    },
    businessModel: {
        type: String,
        enum: ['MANUFACTURING', 'TRADING', 'SERVICE']
    },
    registrationCertificateUrl: { type: String },
    udyamAadhaarUrl: { type: String },
    panUrl: { type: String },
    gstCertificateUrl: { type: String },
    accountHolderName: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String },
    approvalStatus: {
        type: String,
        enum: ['NEW', 'RECHECK', 'ACTIVE', 'REJECTED', 'INACTIVE'],
        default: 'NEW'
    },
    userBusinessId: { type: String, unique: true, sparse: true },
    rejectionComments: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

businessProfileSchema.index({ userId: 1 });
businessProfileSchema.index({ approvalStatus: 1 });

const kycDetailsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    aadhaarNumber: { type: String },
    aadhaarUrl: { type: String },
    panNumber: { type: String },
    panUrl: { type: String },
    bankAccountNumber: { type: String },
    bankIfsc: { type: String },
    bankName: { type: String },
    upiId: { type: String },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// =====================================================
// WALLET & LEDGER SCHEMAS
// =====================================================

const walletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    walletType: {
        type: String,
        enum: ['ADMIN', 'BUSINESS', 'INVESTOR_BUSINESS', 'INVESTOR_INCOME', 'STOCK', 'LOCKER'],
        required: true
    },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    createdAt: { type: Date, default: Date.now }
});

walletSchema.index({ userId: 1, walletType: 1, projectId: 1 }, { unique: true });

const ledgerEntrySchema = new mongoose.Schema({
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    entryType: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    referenceType: {
        type: String,
        enum: ['TOPUP', 'TRANSFER', 'INVESTMENT', 'EMI', 'PAYOUT', 'COMMISSION', 'REFUND', 'PLAN_ACTIVATION'],
        required: true
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now, immutable: true }
});

ledgerEntrySchema.index({ walletId: 1, createdAt: -1 });

const paymentRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL'], default: 'DEPOSIT' },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['BANK_TRANSFER', 'UPI'], required: true },
    transactionId: { type: String },
    paymentScreenshotUrl: { type: String }, // User's screenshot for DEPOSIT
    withdrawalDetails: { type: mongoose.Schema.Types.Mixed }, // Snapshot of user's bank details for WITHDRAWAL
    adminProofUrl: { type: String }, // Admin's screenshot for WITHDRAWAL approval
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminComment: { type: String },
    processedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

paymentRequestSchema.index({ status: 1, createdAt: -1 });

// =====================================================
// PLAN SCHEMAS
// =====================================================

const planSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true },
    features: { type: mongoose.Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const userPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    activatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

userPlanSchema.index({ userId: 1, isActive: 1 });
userPlanSchema.index({ expiresAt: 1 });

// =====================================================
// PROJECT SCHEMAS
// =====================================================

const projectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectName: { type: String, required: true },
    startDate: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String, enum: ['ONLINE', 'OFFLINE'], required: true },
    projectType: { type: String, enum: ['SERVICE', 'TRADING', 'PRODUCTION', 'BUSINESS_EXPANSION', 'NEW_VENTURE', 'PRODUCT_LAUNCH', 'INFRASTRUCTURE', 'TECHNOLOGY', 'OTHER'], required: true },
    projectCost: { type: Number, required: true },
    requiredCapital: { type: Number, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['NEW', 'RECHECK', 'RESUBMIT', 'REJECTED', 'APPROVED', 'LIVE', 'CLOSED'],
        default: 'NEW'
    },
    approvedAt: { type: Date },
    liveAt: { type: Date },
    closedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

projectSchema.index({ userId: 1 });
projectSchema.index({ status: 1 });

// =====================================================
// SHARE/STOCK SCHEMAS
// =====================================================

const shareSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    shareName: { type: String, required: true },
    totalShares: { type: Number, required: true },
    shareValue: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    marketShares: { type: Number, required: true },
    ownerShares: { type: Number, required: true },
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

shareSchema.index({ projectId: 1 });

const shareHoldingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shareId: { type: mongoose.Schema.Types.ObjectId, ref: 'Share', required: true },
    quantity: { type: Number, default: 0 },
    averagePrice: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

shareHoldingSchema.index({ userId: 1, shareId: 1 }, { unique: true });

const shareTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shareId: { type: mongoose.Schema.Types.ObjectId, ref: 'Share', required: true },
    transactionType: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true },
    pricePerShare: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

shareTransactionSchema.index({ userId: 1, createdAt: -1 });

// =====================================================
// CAPITAL OPTIONS & INVESTMENTS
// =====================================================

const capitalOptionSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    optionType: { type: String, enum: ['PARTNERSHIP', 'LOAN', 'FD', 'BOND'], required: true },

    // Partnership fields
    ownershipPercentage: { type: Number },
    minimumInvestment: { type: Number },
    payoutFrequency: { type: String, enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'] },
    profitSharingRatio: { type: Number },

    // Loan fields
    loanAmount: { type: Number },
    interestRate: { type: Number },
    tenureMonths: { type: Number },
    emiAmount: { type: Number },

    // FD fields
    fdAmount: { type: Number },
    fdInterestRate: { type: Number },
    fdTenureMonths: { type: Number },
    maturityAmount: { type: Number },

    // Bond fields
    bondValue: { type: Number },
    couponRate: { type: Number },
    maturityYears: { type: Number },
    isTradable: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

capitalOptionSchema.index({ projectId: 1, optionType: 1 });

const investmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    capitalOptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CapitalOption' },
    investmentAmount: { type: Number, required: true },
    investmentType: { type: String, enum: ['PARTNERSHIP', 'LOAN', 'FD', 'BOND'], required: true },
    status: { type: String, enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },

    // Loan specific
    emiAmount: { type: Number },
    remainingEmis: { type: Number },
    nextEmiDate: { type: Date },

    // FD specific
    maturityDate: { type: Date },
    maturityAmount: { type: Number },

    // Partnership specific
    ownershipPercentage: { type: Number },
    nextPayoutDate: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

investmentSchema.index({ userId: 1 });
investmentSchema.index({ projectId: 1 });

const emiPaymentSchema = new mongoose.Schema({
    investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true },
    emiNumber: { type: Number, required: true },
    emiAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});

emiPaymentSchema.index({ investmentId: 1, status: 1 });
emiPaymentSchema.index({ dueDate: 1 });

// =====================================================
// DOCUMENT SCHEMAS
// =====================================================

const documentTemplateSchema = new mongoose.Schema({
    templateName: { type: String, required: true },
    templateContent: { type: String, required: true },
    documentType: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const generatedDocumentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentTemplate' },
    documentUrl: { type: String },
    generatedAt: { type: Date, default: Date.now }
});

// =====================================================
// NOTIFICATION & ANNOUNCEMENT SCHEMAS
// =====================================================

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    notificationType: { type: String },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, isRead: 1 });

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
    targetAudience: { type: String, enum: ['ADMIN', 'BUSINESS_USER', 'INVESTOR'] },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// =====================================================
// PLATFORM SETTINGS & WATCHLIST
// =====================================================

const platformSettingSchema = new mongoose.Schema({
    settingKey: { type: String, required: true, unique: true },
    settingValue: { type: String, required: true },
    description: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

const watchlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdAt: { type: Date, default: Date.now }
});

watchlistSchema.index({ userId: 1, projectId: 1 }, { unique: true });

// =====================================================
// EXPORT MODELS
// =====================================================

module.exports = {
    User: mongoose.model('User', userSchema),
    UserProfile: mongoose.model('UserProfile', userProfileSchema),
    BusinessProfile: mongoose.model('BusinessProfile', businessProfileSchema),
    KycDetails: mongoose.model('KycDetails', kycDetailsSchema),
    Wallet: mongoose.model('Wallet', walletSchema),
    LedgerEntry: mongoose.model('LedgerEntry', ledgerEntrySchema),
    PaymentRequest: mongoose.model('PaymentRequest', paymentRequestSchema),
    Plan: mongoose.model('Plan', planSchema),
    UserPlan: mongoose.model('UserPlan', userPlanSchema),
    Project: mongoose.model('Project', projectSchema),
    Share: mongoose.model('Share', shareSchema),
    ShareHolding: mongoose.model('ShareHolding', shareHoldingSchema),
    ShareTransaction: mongoose.model('ShareTransaction', shareTransactionSchema),
    CapitalOption: mongoose.model('CapitalOption', capitalOptionSchema),
    Investment: mongoose.model('Investment', investmentSchema),
    EmiPayment: mongoose.model('EmiPayment', emiPaymentSchema),
    DocumentTemplate: mongoose.model('DocumentTemplate', documentTemplateSchema),
    GeneratedDocument: mongoose.model('GeneratedDocument', generatedDocumentSchema),
    Notification: mongoose.model('Notification', notificationSchema),
    Announcement: mongoose.model('Announcement', announcementSchema),
    PlatformSetting: mongoose.model('PlatformSetting', platformSettingSchema),
    Watchlist: mongoose.model('Watchlist', watchlistSchema)
};
