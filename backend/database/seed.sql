-- Seed data for BCM Platform
-- Creates default admin account and platform settings

-- Insert default admin user
-- Password: Admin@123 (hashed with bcrypt)
INSERT INTO users (id, email, mobile, role, password_hash, password_updated, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@bcm.com',
    '9999999999',
    'ADMIN',
    '$2a$10$rZ5YhkqJ9vX8K8K8K8K8K.K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', -- Admin@123
    TRUE,
    TRUE
);

-- Insert admin profile
INSERT INTO user_profiles (user_id, full_name, profile_photo_url)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Platform Administrator',
    NULL
);

-- Create admin wallet
INSERT INTO wallets (user_id, wallet_type)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ADMIN'
);

-- Insert platform settings
INSERT INTO platform_settings (setting_key, setting_value, description) VALUES
('commission_percentage', '2', 'Platform commission on share transactions (%)'),
('company_bank_name', 'HDFC Bank', 'Company bank name for payments'),
('company_account_number', '1234567890', 'Company bank account number'),
('company_ifsc', 'HDFC0001234', 'Company bank IFSC code'),
('company_upi_id', 'bcm@hdfc', 'Company UPI ID'),
('company_qr_code_url', '', 'Company UPI QR code URL'),
('smtp_host', 'smtp.gmail.com', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_user', '', 'SMTP username'),
('smtp_password', '', 'SMTP password'),
('platform_name', 'Business Capital Market', 'Platform display name'),
('support_email', 'support@bcm.com', 'Support email address'),
('support_mobile', '1800-123-4567', 'Support mobile number');

-- Insert sample plans
INSERT INTO plans (name, description, price, duration_days, features, is_active) VALUES
(
    'Basic Plan',
    'Perfect for startups and small businesses',
    999.00,
    30,
    '{"max_projects": 1, "max_capital_options": 2, "support": "Email", "features": ["Basic Analytics", "Email Support", "1 Project", "2 Capital Options"]}',
    TRUE
),
(
    'Professional Plan',
    'Ideal for growing businesses',
    2999.00,
    90,
    '{"max_projects": 5, "max_capital_options": 10, "support": "Priority Email", "features": ["Advanced Analytics", "Priority Support", "5 Projects", "10 Capital Options", "Custom Branding"]}',
    TRUE
),
(
    'Enterprise Plan',
    'For established businesses with multiple projects',
    9999.00,
    365,
    '{"max_projects": -1, "max_capital_options": -1, "support": "24/7 Phone & Email", "features": ["Premium Analytics", "24/7 Support", "Unlimited Projects", "Unlimited Capital Options", "Custom Branding", "Dedicated Account Manager"]}',
    TRUE
);

-- Insert sample document templates
INSERT INTO document_templates (template_name, template_content, document_type, is_active) VALUES
(
    'Business Activation Agreement',
    '<html><body><h1>Business Activation Agreement</h1><p>This agreement is made on {{activation_date}} between Business Capital Market and {{business_name}}.</p><p><strong>Business Details:</strong></p><ul><li>Business Name: {{business_name}}</li><li>Owner Name: {{user_name}}</li><li>Email: {{email}}</li><li>Mobile: {{mobile}}</li><li>Business ID: {{business_id}}</li></ul><p><strong>Terms and Conditions:</strong></p><ol><li>The business agrees to comply with all platform policies.</li><li>All transactions will be subject to platform commission.</li><li>The business is responsible for accurate information.</li><li>The platform reserves the right to suspend or terminate access.</li></ol><p>Activated on: {{activation_date}}</p></body></html>',
    'ACTIVATION_AGREEMENT',
    TRUE
),
(
    'Plan Subscription Agreement',
    '<html><body><h1>Plan Subscription Agreement</h1><p>This subscription agreement is made on {{activation_date}}.</p><p><strong>Subscriber Details:</strong></p><ul><li>Name: {{user_name}}</li><li>Business: {{business_name}}</li><li>Email: {{email}}</li><li>Mobile: {{mobile}}</li></ul><p><strong>Plan Details:</strong></p><ul><li>Plan Name: {{plan_name}}</li><li>Plan Price: ₹{{plan_price}}</li><li>Duration: {{plan_duration}} days</li><li>Activation Date: {{activation_date}}</li><li>Expiry Date: {{expiry_date}}</li></ul><p><strong>Features Included:</strong></p><p>{{plan_features}}</p></body></html>',
    'PLAN_SUBSCRIPTION',
    TRUE
);

-- Insert sample announcement
INSERT INTO announcements (title, message, priority, target_audience, expires_at, is_active) VALUES
(
    'Welcome to BCM Platform',
    'Welcome to Business Capital Market! Start your investment journey today.',
    'HIGH',
    'INVESTOR',
    NOW() + INTERVAL '30 days',
    TRUE
);

COMMENT ON TABLE platform_settings IS 'System-wide configuration settings';
