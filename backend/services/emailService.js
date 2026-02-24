const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Service for sending notifications
 * Emails are ONLY sent when EMAIL_ENABLED=true in environment variables.
 * Set EMAIL_ENABLED=true + SMTP_USER + SMTP_PASS to enable real sending.
 * Default (no env vars): all emails are logged to console only.
 */

class EmailService {
    constructor() {
        // Only initialise transporter when explicitly enabled via env var.
        // Never send email unless EMAIL_ENABLED=true is set.
        const enabled =
            process.env.EMAIL_ENABLED === 'true' &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS;

        if (enabled) {
            this.transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            console.log('Email service: SMTP transport initialised.');
        } else {
            this.transporter = null;
            console.log('Email service: EMAIL_ENABLED is not true — all emails will be logged only.');
        }
    }

    /**
     * Send email (or log if EMAIL_ENABLED != true)
     */
    async sendEmail(to, subject, html) {
        // Global kill-switch: if EMAIL_ENABLED is not explicitly "true", never send.
        if (process.env.EMAIL_ENABLED !== 'true') {
            console.log('[EMAIL BLOCKED - EMAIL_ENABLED not set] To:', to, '| Subject:', subject);
            return { success: true, logged: true };
        }

        try {
            if (this.transporter) {
                const info = await this.transporter.sendMail({
                    from: `"BCM Platform" <${process.env.SMTP_USER}>`,
                    to,
                    subject,
                    html
                });
                console.log('Email sent:', info.messageId);
                return { success: true, messageId: info.messageId };
            } else {
                console.log('[EMAIL LOG - no transporter] To:', to, '| Subject:', subject);
                return { success: true, logged: true };
            }
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send business approval notification
     */
    async sendBusinessApprovalEmail(email, businessName, status, comments = null) {
        const subject = status === 'ACTIVE'
            ? 'Business Approved - Welcome to BCM!'
            : status === 'RECHECK'
                ? 'Business Application - Recheck Required'
                : 'Business Application Update';

        let html = `
      <h2>Business Application Update</h2>
      <p>Dear ${businessName},</p>
    `;

        if (status === 'ACTIVE') {
            html += `
        <p>Congratulations! Your business has been approved and activated on the BCM platform.</p>
        <p>You can now access all platform features and start creating projects.</p>
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Activate a subscription plan</li>
          <li>Create your first project</li>
          <li>Start raising capital</li>
        </ul>
      `;
        } else if (status === 'RECHECK') {
            html += `
        <p>Your business application requires some updates. Please review the comments below and resubmit.</p>
        <p><strong>Comments:</strong></p>
        <pre>${JSON.stringify(comments, null, 2)}</pre>
      `;
        } else if (status === 'REJECTED') {
            html += `
        <p>We regret to inform you that your business application has been rejected.</p>
        <p><strong>Reason:</strong></p>
        <pre>${JSON.stringify(comments, null, 2)}</pre>
      `;
        }

        html += `
      <p>Best regards,<br>BCM Platform Team</p>
    `;

        return await this.sendEmail(email, subject, html);
    }

    /**
     * Send payment request status notification
     */
    async sendPaymentStatusEmail(email, amount, status, comments = null) {
        const subject = status === 'APPROVED'
            ? 'Payment Approved - Wallet Credited'
            : 'Payment Request Update';

        let html = `
      <h2>Payment Request Update</h2>
      <p>Dear User,</p>
      <p>Your payment request for ₹${amount} has been ${status.toLowerCase()}.</p>
    `;

        if (status === 'APPROVED') {
            html += `<p>Your wallet has been credited with ₹${amount}.</p>`;
        } else if (status === 'REJECTED' && comments) {
            html += `
        <p><strong>Reason:</strong> ${comments}</p>
        <p>Please resubmit with correct payment proof.</p>
      `;
        }

        html += `
      <p>Best regards,<br>BCM Platform Team</p>
    `;

        return await this.sendEmail(email, subject, html);
    }

    /**
     * Send plan activation confirmation
     */
    async sendPlanActivationEmail(email, planName, expiryDate) {
        const subject = 'Plan Activated Successfully';
        const html = `
      <h2>Plan Activation Confirmation</h2>
      <p>Dear User,</p>
      <p>Your <strong>${planName}</strong> has been activated successfully.</p>
      <p><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
      <p>You can now access all plan features.</p>
      <p>Best regards,<br>BCM Platform Team</p>
    `;

        return await this.sendEmail(email, subject, html);
    }

    /**
     * Send project status update
     */
    async sendProjectStatusEmail(email, projectName, status) {
        const subject = `Project ${status} - ${projectName}`;
        const html = `
      <h2>Project Status Update</h2>
      <p>Dear User,</p>
      <p>Your project <strong>${projectName}</strong> has been ${status.toLowerCase()}.</p>
      ${status === 'LIVE' ? '<p>Your project is now visible to investors!</p>' : ''}
      <p>Best regards,<br>BCM Platform Team</p>
    `;

        return await this.sendEmail(email, subject, html);
    }

    /**
     * Send investment confirmation
     */
    async sendInvestmentConfirmationEmail(email, projectName, amount, investmentType) {
        const subject = 'Investment Confirmed';
        const html = `
      <h2>Investment Confirmation</h2>
      <p>Dear Investor,</p>
      <p>Your investment of ₹${amount} in <strong>${projectName}</strong> has been confirmed.</p>
      <p><strong>Investment Type:</strong> ${investmentType}</p>
      <p>You can track your investment in the Portfolio section.</p>
      <p>Best regards,<br>BCM Platform Team</p>
    `;

        return await this.sendEmail(email, subject, html);
    }

    /**
     * Send EMI reminder
     */
    async sendEMIReminderEmail(email, projectName, emiAmount, dueDate) {
        const subject = 'EMI Payment Reminder';
        const html = `
      <h2>EMI Payment Reminder</h2>
      <p>Dear User,</p>
      <p>This is a reminder that your EMI payment of ₹${emiAmount} for <strong>${projectName}</strong> is due on ${new Date(dueDate).toLocaleDateString()}.</p>
      <p>The amount will be automatically debited from your wallet.</p>
      <p>Best regards,<br>BCM Platform Team</p>
    `;

        return await this.sendEmail(email, subject, html);
    }

    /**
     * Send FD maturity notification
     */
    async sendFDMaturityEmail(email, projectName, maturityAmount) {
        const subject = 'FD Matured - Amount Credited';
        const html = `
      <h2>FD Maturity Notification</h2>
      <p>Dear Investor,</p>
      <p>Your Fixed Deposit in <strong>${projectName}</strong> has matured.</p>
      <p>₹${maturityAmount} has been credited to your income wallet.</p>
      <p>Best regards,<br>BCM Platform Team</p>
    `;

        return await this.sendEmail(email, subject, html);
    }

    /**
     * Send password update confirmation
     */
    async sendPasswordUpdateEmail(email, name) {
        const subject = 'Password Updated Successfully';
        const html = `
      <h2>Password Update Confirmation</h2>
      <p>Dear ${name},</p>
      <p>Your password has been updated successfully.</p>
      <p>If you did not make this change, please contact support immediately.</p>
      <p>Best regards,<br>BCM Platform Team</p>
    `;

        return await this.sendEmail(email, subject, html);
    }

    /**
     * Send OTP email
     */
    async sendOTPEmail(email, otp) {
        const subject = 'Your OTP for BCM Platform';
        const html = `
      <h2>OTP Verification</h2>
      <p>Your OTP is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>Do not share this OTP with anyone.</p>
      <p>Best regards,<br>BCM Platform Team</p>
    `;

        return await this.sendEmail(email, subject, html);
    }
}

module.exports = new EmailService();
