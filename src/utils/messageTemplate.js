/**
 * Message Template Utility
 * Formats lead data into professional WhatsApp notification messages
 */

/**
 * Format lead data into WhatsApp notification message
 * @param {object} lead - Lead data object
 * @returns {string} Formatted message
 */
function formatNotificationMessage(lead) {
    const {
        companyName = 'N/A',
        industry = 'N/A',
        location = 'N/A',
        suggestedProduct = 'N/A',
        priority = 'HIGH',
        reason = 'No additional details provided.'
    } = lead;

    return `🚨 *New High-Priority Lead Detected*

🏭 Company: ${companyName}
🏢 Industry: ${industry}
📍 Location: ${location}
🛢 Suggested Product: ${suggestedProduct}
⭐ Priority: ${priority}

📌 Reason:
${reason}

👉 Please open the Sales App for full lead details.`;
}

module.exports = {
    formatNotificationMessage
};
