/**
 * Email Notification Service
 * Handles business logic for sending email notifications
 */

const { sendEmail, isEmailReady } = require('./emailService');
const { formatEmailNotification } = require('../utils/emailTemplate');
const { isWithinNotificationHours } = require('../utils/timeUtils');
const { isDuplicate, markAsSent } = require('../utils/duplicateTracker');

/**
 * Validate lead eligibility for email notification
 * @param {object} lead - Lead data
 * @returns {{eligible: boolean, reason?: string}}
 */
function validateEmailEligibility(lead) {
    const { priority, status, salesOfficer } = lead;

    // Check priority
    if (!priority || priority.toUpperCase() !== 'HIGH') {
        return {
            eligible: false,
            reason: 'Only HIGH priority leads are notified'
        };
    }

    // Check status if provided
    if (status && status.toUpperCase() !== 'NEW') {
        return {
            eligible: false,
            reason: 'Only NEW leads are notified'
        };
    }

    // Check sales officer email
    if (!salesOfficer || !salesOfficer.email) {
        return {
            eligible: false,
            reason: 'Sales officer email address is required'
        };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(salesOfficer.email)) {
        return {
            eligible: false,
            reason: 'Invalid email address format'
        };
    }

    return { eligible: true };
}

/**
 * Send email notification for a lead
 * @param {object} lead - Lead data
 * @returns {Promise<{status: string, message: string, details?: object}>}
 */
async function sendEmailNotification(lead) {
    console.log('\n═══════════════════════════════════════');
    console.log('📧 Processing email notification request...');
    console.log('═══════════════════════════════════════');

    // Step 1: Validate lead eligibility
    const validation = validateEmailEligibility(lead);
    if (!validation.eligible) {
        console.log(`⏭️ Skipping: ${validation.reason}`);
        return {
            status: 'SKIPPED',
            message: validation.reason
        };
    }

    // Step 2: Check notification hours (can be bypassed with skipTimeCheck for testing)
    if (!lead.skipTimeCheck && !isWithinNotificationHours()) {
        console.log('⏭️ Skipping: Outside notification hours (09:00-19:00 IST)');
        return {
            status: 'SKIPPED',
            message: 'Notifications are only sent between 09:00-19:00 IST'
        };
    }

    // Step 3: Check for duplicate (use email-specific key)
    const emailLeadKey = { ...lead, _channel: 'email' };
    if (isDuplicate(emailLeadKey)) {
        return {
            status: 'SKIPPED',
            message: 'Duplicate notification - already sent for this lead within the last hour'
        };
    }

    // Step 4: Check email service status
    if (!isEmailReady()) {
        console.error('❌ Email service not configured');
        return {
            status: 'FAILED',
            message: 'Email service not configured. Set SMTP settings in .env file.'
        };
    }

    // Step 5: Format and send email
    const { html, text, subject } = formatEmailNotification(lead);
    const result = await sendEmail(lead.salesOfficer.email, subject, html, text);

    if (result.success) {
        // Mark as sent to prevent duplicates
        markAsSent(emailLeadKey);
        
        console.log('✅ Email notification sent successfully');
        return {
            status: 'SENT',
            message: 'Email notification sent successfully',
            details: {
                messageId: result.messageId,
                recipient: lead.salesOfficer.email,
                company: lead.companyName
            }
        };
    } else {
        console.error('❌ Failed to send email notification');
        return {
            status: 'FAILED',
            message: result.error || 'Failed to send email'
        };
    }
}

module.exports = {
    sendEmailNotification,
    validateEmailEligibility
};
