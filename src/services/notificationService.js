/**
 * Notification Service
 * Handles business logic for sending WhatsApp notifications
 */

const whatsappService = require('./whatsappService');
const { formatNotificationMessage } = require('../utils/messageTemplate');
const { isWithinNotificationHours } = require('../utils/timeUtils');
const { isDuplicate, markAsSent } = require('../utils/duplicateTracker');

/**
 * Validate lead eligibility for notification
 * @param {object} lead - Lead data
 * @returns {{eligible: boolean, reason?: string}}
 */
function validateLeadEligibility(lead) {
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

    // Check sales officer phone
    if (!salesOfficer || !salesOfficer.phone) {
        return {
            eligible: false,
            reason: 'Sales officer phone number is required'
        };
    }

    // Validate phone number format (basic check)
    const phone = salesOfficer.phone.replace(/\D/g, '');
    if (phone.length < 10) {
        return {
            eligible: false,
            reason: 'Invalid phone number format'
        };
    }

    return { eligible: true };
}

/**
 * Send notification for a lead
 * @param {object} lead - Lead data
 * @returns {Promise<{status: string, message: string, details?: object}>}
 */
async function sendNotification(lead) {
    console.log('\n═══════════════════════════════════════');
    console.log('📨 Processing notification request...');
    console.log('═══════════════════════════════════════');

    // Step 1: Validate lead eligibility
    const validation = validateLeadEligibility(lead);
    if (!validation.eligible) {
        console.log(`⏭️ Skipping: ${validation.reason}`);
        return {
            status: 'SKIPPED',
            message: validation.reason
        };
    }

    // Step 2: Check notification hours
    if (!lead.skipTimeCheck && !isWithinNotificationHours()) {
        console.log('⏭️ Skipping: Outside notification hours (09:00-19:00 IST)');
        return {
            status: 'SKIPPED',
            message: 'Notifications are only sent between 09:00-19:00 IST'
        };
    }

    // Step 3: Check for duplicate
    if (isDuplicate(lead)) {
        return {
            status: 'SKIPPED',
            message: 'Duplicate notification - already sent for this lead within the last hour'
        };
    }

    // Step 4: Check WhatsApp client status
    if (!whatsappService.isClientReady()) {
        console.error('❌ WhatsApp client not connected');
        return {
            status: 'FAILED',
            message: 'WhatsApp client not connected. Please scan QR code to authenticate.',
            fallback: 'Trigger in-app notification as fallback'
        };
    }

    // Step 5: Format and send message
    const message = formatNotificationMessage(lead);
    const result = await whatsappService.sendMessage(lead.salesOfficer.phone, message);

    if (result.success) {
        // Mark as sent to prevent duplicates
        markAsSent(lead);
        
        console.log('✅ Notification sent successfully');
        return {
            status: 'SENT',
            message: 'Notification sent successfully',
            details: {
                messageId: result.messageId,
                recipient: lead.salesOfficer.name,
                company: lead.companyName
            }
        };
    } else {
        console.error('❌ Failed to send notification');
        return {
            status: 'FAILED',
            message: result.error || 'Failed to send WhatsApp message',
            fallback: 'Trigger in-app notification as fallback'
        };
    }
}

module.exports = {
    sendNotification,
    validateLeadEligibility
};
