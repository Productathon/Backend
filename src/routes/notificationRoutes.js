/**
 * Notification Routes
 * API endpoints for lead notifications
 */

const express = require('express');
const router = express.Router();
const { sendNotification } = require('../services/notificationService');
const { getStatus } = require('../services/whatsappService');
const { getTrackedCount } = require('../utils/duplicateTracker');

/**
 * POST /api/notify
 * Send a WhatsApp notification for a lead
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

        // Process notification
        const result = await sendNotification(lead);

        // Determine HTTP status based on result
        let httpStatus = 200;
        if (result.status === 'FAILED') {
            httpStatus = 503; // Service unavailable
        } else if (result.status === 'SKIPPED') {
            httpStatus = 200; // OK but skipped
        }

        return res.status(httpStatus).json(result);

    } catch (error) {
        console.error('❌ Error processing notification:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * GET /api/status
 * Get WhatsApp client status
 */
router.get('/status', (req, res) => {
    const status = getStatus();
    const trackedLeads = getTrackedCount();

    res.json({
        whatsapp: status.connected ? 'connected' : 'disconnected',
        phoneInfo: status.info ? {
            pushname: status.info.pushname,
            phone: status.info.wid?.user
        } : null,
        trackedLeads
    });
});

module.exports = router;
