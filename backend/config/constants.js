// Application Constants

module.exports = {
    // User Roles
    ROLES: {
        ADMIN: 'ADMIN',
        BUSINESS_USER: 'BUSINESS_USER',
        INVESTOR: 'INVESTOR'
    },

    // Approval Status
    APPROVAL_STATUS: {
        NEW: 'NEW',
        RECHECK: 'RECHECK',
        ACTIVE: 'ACTIVE',
        REJECTED: 'REJECTED',
        INACTIVE: 'INACTIVE'
    },

    // Project Status
    PROJECT_STATUS: {
        NEW: 'NEW',
        RECHECK: 'RECHECK',
        RESUBMIT: 'RESUBMIT',
        REJECTED: 'REJECTED',
        APPROVED: 'APPROVED',
        LIVE: 'LIVE',
        CLOSED: 'CLOSED'
    },

    // Wallet Types
    WALLET_TYPES: {
        ADMIN: 'ADMIN',
        BUSINESS: 'BUSINESS',
        INVESTOR_BUSINESS: 'INVESTOR_BUSINESS',
        INVESTOR_INCOME: 'INVESTOR_INCOME',
        STOCK: 'STOCK',
        LOCKER: 'LOCKER'
    },

    // Entry Types
    ENTRY_TYPES: {
        CREDIT: 'CREDIT',
        DEBIT: 'DEBIT'
    },

    // Reference Types
    REFERENCE_TYPES: {
        TOPUP: 'TOPUP',
        TRANSFER: 'TRANSFER',
        INVESTMENT: 'INVESTMENT',
        EMI: 'EMI',
        PAYOUT: 'PAYOUT',
        COMMISSION: 'COMMISSION',
        REFUND: 'REFUND',
        PLAN_ACTIVATION: 'PLAN_ACTIVATION'
    },

    // Payment Status
    PAYMENT_STATUS: {
        PENDING: 'PENDING',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED'
    },

    // Capital Option Types
    CAPITAL_TYPES: {
        PARTNERSHIP: 'PARTNERSHIP',
        LOAN: 'LOAN',
        FD: 'FD',
        BOND: 'BOND'
    },

    // Investment Status
    INVESTMENT_STATUS: {
        PENDING: 'PENDING',
        ACTIVE: 'ACTIVE',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED'
    },

    // Password Validation
    PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

    // File Upload
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
};
