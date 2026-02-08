/**
 * Time Utilities
 * Handles IST time checking for notification restrictions
 */

/**
 * Check if current time is within allowed notification hours (09:00-19:00 IST)
 * @returns {boolean} True if within allowed hours
 */
function isWithinNotificationHours() {
    // Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60; // IST is UTC+5:30
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const istMinutes = utcMinutes + istOffset;
    
    // Handle day overflow
    const adjustedMinutes = istMinutes >= 1440 ? istMinutes - 1440 : istMinutes;
    const hours = Math.floor(adjustedMinutes / 60);
    
    // Check if between 09:00 (540 minutes) and 19:00 (1140 minutes)
    const startHour = 9;
    const endHour = 19;
    
    const isWithin = hours >= startHour && hours < endHour;
    
    console.log(`⏰ Current IST hour: ${hours}:${String(Math.floor(adjustedMinutes % 60)).padStart(2, '0')} - Notifications ${isWithin ? 'ALLOWED' : 'RESTRICTED'}`);
    
    return isWithin;
}

/**
 * Get current IST time as formatted string
 * @returns {string} Formatted IST time
 */
function getCurrentISTTime() {
    const now = new Date();
    return now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

module.exports = {
    isWithinNotificationHours,
    getCurrentISTTime
};
