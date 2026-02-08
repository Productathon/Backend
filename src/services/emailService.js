/**
 * Email Service
 * Handles email notifications using Nodemailer
 */

const nodemailer = require('nodemailer');

// Email transporter instance
let transporter = null;
let isConfigured = false;

/**
 * Initialize email transporter with SMTP settings
 */
function initializeEmailService() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.log('⚠️ Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
        return false;
    }

    try {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT) || 587,
            secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });

        isConfigured = true;
        console.log('✅ Email service configured successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to configure email service:', error.message);
        return false;
    }
}

/**
 * Check if email service is ready
 * @returns {boolean}
 */
function isEmailReady() {
    return isConfigured && transporter !== null;
}

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text fallback
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEmail(to, subject, html, text) {
    if (!isEmailReady()) {
        console.error('❌ Email service not configured');
        return {
            success: false,
            error: 'Email service not configured. Check SMTP settings in .env'
        };
    }

    try {
        const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER;
        
        console.log(`📧 Sending email to: ${to}`);
        
        const info = await transporter.sendMail({
            from: fromAddress,
            to: to,
            subject: subject,
            text: text,
            html: html
        });

        console.log(`✅ Email sent successfully. ID: ${info.messageId}`);
        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Verify email connection
 * @returns {Promise<boolean>}
 */
async function verifyConnection() {
    if (!transporter) return false;
    
    try {
        await transporter.verify();
        console.log('✅ Email server connection verified');
        return true;
    } catch (error) {
        console.error('❌ Email server connection failed:', error.message);
        return false;
    }
}

/**
 * Get email service status
 * @returns {{configured: boolean, host: string|null}}
 */
function getEmailStatus() {
    return {
        configured: isConfigured,
        host: process.env.SMTP_HOST || null
    };
}

module.exports = {
    initializeEmailService,
    isEmailReady,
    sendEmail,
    verifyConnection,
    getEmailStatus
};
