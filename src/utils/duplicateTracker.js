/**
 * Duplicate Tracker
 * Prevents sending duplicate notifications for the same lead
 */

// In-memory storage for sent lead identifiers
const sentLeads = new Map();

// Default TTL: 1 hour (in milliseconds)
const DEFAULT_TTL = 60 * 60 * 1000;

/**
 * Generate a unique identifier for a lead
 * @param {object} lead - Lead data
 * @returns {string} Unique lead identifier
 */
function generateLeadId(lead) {
    const { companyName, salesOfficer } = lead;
    const phone = salesOfficer?.phone || '';
    // Create a composite key from company name and officer phone
    return `${companyName}_${phone}`.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Check if a lead notification was already sent
 * @param {object} lead - Lead data
 * @returns {boolean} True if already sent
 */
function isDuplicate(lead) {
    const leadId = generateLeadId(lead);
    
    if (sentLeads.has(leadId)) {
        const sentTime = sentLeads.get(leadId);
        const now = Date.now();
        
        // Check if still within TTL
        if (now - sentTime < DEFAULT_TTL) {
            console.log(`🔄 Duplicate detected for lead: ${leadId}`);
            return true;
        }
        
        // TTL expired, remove old entry
        sentLeads.delete(leadId);
    }
    
    return false;
}

/**
 * Mark a lead as sent
 * @param {object} lead - Lead data
 */
function markAsSent(lead) {
    const leadId = generateLeadId(lead);
    sentLeads.set(leadId, Date.now());
    console.log(`📝 Marked lead as sent: ${leadId}`);
}

/**
 * Clean up expired entries (run periodically)
 */
function cleanupExpired() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [leadId, sentTime] of sentLeads.entries()) {
        if (now - sentTime >= DEFAULT_TTL) {
            sentLeads.delete(leadId);
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} expired lead entries`);
    }
}

/**
 * Get count of tracked leads
 * @returns {number}
 */
function getTrackedCount() {
    return sentLeads.size;
}

// Run cleanup every 15 minutes
setInterval(cleanupExpired, 15 * 60 * 1000);

module.exports = {
    isDuplicate,
    markAsSent,
    cleanupExpired,
    getTrackedCount
};
