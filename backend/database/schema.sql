-- Business Capital Market (BCM) Platform Database Schema
-- PostgreSQL / Supabase Compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'BUSINESS_USER', 'INVESTOR');
CREATE TYPE business_type AS ENUM ('PROPRIETORSHIP', 'PVT_LTD', 'LIMITED', 'PARTNERSHIP', 'LLP');
CREATE TYPE business_model AS ENUM ('MANUFACTURING', 'TRADING', 'SERVICE');
CREATE TYPE approval_status AS ENUM ('NEW', 'RECHECK', 'ACTIVE', 'REJECTED', 'INACTIVE');
CREATE TYPE project_status AS ENUM ('NEW', 'RECHECK', 'RESUBMIT', 'REJECTED', 'APPROVED', 'LIVE', 'CLOSED');
CREATE TYPE wallet_type AS ENUM ('ADMIN', 'BUSINESS', 'INVESTOR_BUSINESS', 'INVESTOR_INCOME', 'STOCK', 'LOCKER');
CREATE TYPE entry_type AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE reference_type AS ENUM ('TOPUP', 'TRANSFER', 'INVESTMENT', 'EMI', 'PAYOUT', 'COMMISSION', 'REFUND', 'PLAN_ACTIVATION');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'UPI');
CREATE TYPE payment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE project_category AS ENUM ('ONLINE', 'OFFLINE');
CREATE TYPE project_type AS ENUM ('SERVICE', 'TRADING', 'PRODUCTION');
CREATE TYPE capital_option_type AS ENUM ('PARTNERSHIP', 'LOAN', 'FD', 'BOND');
CREATE TYPE investment_status AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE payout_frequency AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- =====================================================
-- CORE USER TABLES
-- =====================================================

-- Users table (syncs with Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(15),
    role user_role NOT NULL DEFAULT 'INVESTOR',
    password_hash VARCHAR(255),
    password_updated BOOLEAN DEFAULT FALSE,
    google_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles (personal information)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    profile_photo_url TEXT,
    aadhaar_number VARCHAR(12),
    pan_number VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business profiles
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    business_logo_url TEXT,
    business_type business_type,
    business_model business_model,
    registration_certificate_url TEXT,
    udyam_aadhaar_url TEXT,
    pan_url TEXT,
    gst_certificate_url TEXT,
    account_holder_name VARCHAR(255),
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(11),
    upi_id VARCHAR(100),
    approval_status approval_status DEFAULT 'NEW',
    user_business_id VARCHAR(50) UNIQUE, -- Generated after approval
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business approval tracking
CREATE TABLE business_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id),
    status approval_status NOT NULL,
    personal_details_approved BOOLEAN DEFAULT FALSE,
    business_details_approved BOOLEAN DEFAULT FALSE,
    documents_approved BOOLEAN DEFAULT FALSE,
    banking_details_approved BOOLEAN DEFAULT FALSE,
    rejection_comments JSONB, -- {field: "comment"}
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KYC details for investors
CREATE TABLE kyc_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    aadhaar_number VARCHAR(12),
    aadhaar_url TEXT,
    pan_number VARCHAR(10),
    pan_url TEXT,
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(11),
    bank_name VARCHAR(255),
    upi_id VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- WALLET & LEDGER SYSTEM
-- =====================================================

-- Wallets
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_type wallet_type NOT NULL,
    project_id UUID, -- For stock/locker wallets
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, wallet_type, project_id)
);

-- Ledger entries (immutable)
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    entry_type entry_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    reference_type reference_type NOT NULL,
    reference_id UUID,
    metadata JSONB, -- Additional context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Index for fast balance calculation
CREATE INDEX idx_ledger_wallet ON ledger_entries(wallet_id);
CREATE INDEX idx_ledger_created ON ledger_entries(created_at DESC);

-- Payment requests (manual verification)
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_screenshot_url TEXT NOT NULL,
    status payment_status DEFAULT 'PENDING',
    admin_id UUID REFERENCES users(id),
    admin_comment TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PLAN MANAGEMENT
-- =====================================================

-- Plans
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User plans (active subscriptions)
CREATE TABLE user_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PROJECT MANAGEMENT
-- =====================================================

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    location TEXT NOT NULL,
    category project_category NOT NULL,
    project_type project_type NOT NULL,
    project_cost DECIMAL(15, 2) NOT NULL,
    required_capital DECIMAL(15, 2) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'NEW',
    approved_at TIMESTAMP,
    live_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project approvals
CREATE TABLE project_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id),
    status project_status NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SHARE/STOCK SYSTEM
-- =====================================================

-- Shares definition
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    share_name VARCHAR(255) NOT NULL,
    total_shares INTEGER NOT NULL,
    share_value DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    market_shares INTEGER NOT NULL, -- 50% in stock wallet
    owner_shares INTEGER NOT NULL, -- 50% in locker wallet
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Share holdings
CREATE TABLE share_holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    average_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, share_id)
);

-- Share transactions
CREATE TABLE share_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL, -- BUY, SELL
    quantity INTEGER NOT NULL,
    price_per_share DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    commission DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CAPITAL OPTIONS
-- =====================================================

-- Capital options (Partnership, Loan, FD, Bond)
CREATE TABLE capital_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    option_type capital_option_type NOT NULL,
    
    -- Partnership fields
    ownership_percentage DECIMAL(5, 2),
    minimum_investment DECIMAL(15, 2),
    payout_frequency payout_frequency,
    profit_sharing_ratio DECIMAL(5, 2),
    
    -- Loan fields
    loan_amount DECIMAL(15, 2),
    interest_rate DECIMAL(5, 2),
    tenure_months INTEGER,
    emi_amount DECIMAL(10, 2),
    
    -- FD fields
    fd_amount DECIMAL(15, 2),
    fd_interest_rate DECIMAL(5, 2),
    fd_tenure_months INTEGER,
    maturity_amount DECIMAL(15, 2),
    
    -- Bond fields
    bond_value DECIMAL(15, 2),
    coupon_rate DECIMAL(5, 2),
    maturity_years INTEGER,
    is_tradable BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    capital_option_id UUID REFERENCES capital_options(id),
    investment_amount DECIMAL(15, 2) NOT NULL,
    investment_type capital_option_type NOT NULL,
    status investment_status DEFAULT 'PENDING',
    
    -- Loan specific
    emi_amount DECIMAL(10, 2),
    remaining_emis INTEGER,
    next_emi_date DATE,
    
    -- FD specific
    maturity_date DATE,
    maturity_amount DECIMAL(15, 2),
    
    -- Partnership specific
    ownership_percentage DECIMAL(5, 2),
    next_payout_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMI payments tracking
CREATE TABLE emi_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
    emi_number INTEGER NOT NULL,
    emi_amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, OVERDUE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DOCUMENTS
-- =====================================================

-- Document templates
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(255) NOT NULL,
    template_content TEXT NOT NULL, -- HTML with placeholders
    document_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated documents
CREATE TABLE generated_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES document_templates(id),
    document_url TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICATIONS & ANNOUNCEMENTS
-- =====================================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin announcements (for mobile app popups)
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    target_audience user_role,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

-- Platform settings
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist (for investors)
CREATE TABLE watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, project_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_business_profiles_user ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_status ON business_profiles(approval_status);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_shares_project ON shares(project_id);
CREATE INDEX idx_share_holdings_user ON share_holdings(user_id);
CREATE INDEX idx_investments_user ON investments(user_id);
CREATE INDEX idx_investments_project ON investments(project_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_wallets_user ON wallets(user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON business_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shares_updated_at BEFORE UPDATE ON shares
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate wallet balance
CREATE OR REPLACE FUNCTION get_wallet_balance(wallet_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    balance DECIMAL(15, 2);
BEGIN
    SELECT 
        COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END), 0)
    INTO balance
    FROM ledger_entries
    WHERE wallet_id = wallet_uuid;
    
    RETURN COALESCE(balance, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for wallet balances
CREATE OR REPLACE VIEW wallet_balances AS
SELECT 
    w.id as wallet_id,
    w.user_id,
    w.wallet_type,
    w.project_id,
    get_wallet_balance(w.id) as balance,
    w.created_at
FROM wallets w;

-- View for active investments summary
CREATE OR REPLACE VIEW investment_summary AS
SELECT 
    i.user_id,
    i.investment_type,
    COUNT(*) as total_investments,
    SUM(i.investment_amount) as total_invested,
    SUM(CASE WHEN i.status = 'ACTIVE' THEN i.investment_amount ELSE 0 END) as active_amount
FROM investments i
GROUP BY i.user_id, i.investment_type;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Core user authentication and role management';
COMMENT ON TABLE wallets IS 'Wallet metadata - actual balance calculated from ledger_entries';
COMMENT ON TABLE ledger_entries IS 'Immutable transaction ledger - never update or delete';
COMMENT ON TABLE shares IS 'Share definitions with 50/50 split between market and owner';
COMMENT ON TABLE capital_options IS 'Investment options: Partnership, Loan, FD, Bond';
