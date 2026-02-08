/**
 * Email Notification Routes
 * API endpoints for email notifications
 */

const express = require('express');
const router = express.Router();
const { sendEmailNotification } = require('../services/emailNotificationService');
const { getEmailStatus } = require('../services/emailService');

/**
 * POST /api/email/notify
 * Send an email notification for a lead
 */
router.post('/notify', async (req, res) => {
    try {
        const lead = req.body;

        // Basic request validation
        if (!lead || Object.keys(lead).length === 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Request body is required'
            });
        }

        // Process email notification
        const result = await sendEmailNotification(lead);

        // Determine HTTP status based on result
        let httpStatus = 200;
        if (result.status === 'FAILED') {
            httpStatus = 503; // Service unavailable
        }

        return res.status(httpStatus).json(result);

    } catch (error) {
        console.error('❌ Error processing email notification:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * GET /api/email/status
 * Get email service status
 */
router.get('/status', (req, res) => {
    const status = getEmailStatus();
    res.json({
        email: status.configured ? 'configured' : 'not_configured',
        smtpHost: status.host
    });
});

module.exports = router;
