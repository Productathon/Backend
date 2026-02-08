/**
 * WhatsApp Service
 * Manages WhatsApp Web client connection and message sending
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Client state
let client = null;
let isReady = false;

/**
 * Initialize WhatsApp client with QR code authentication
 */
function initializeClient() {
    return new Promise((resolve, reject) => {
        console.log('📱 Initializing WhatsApp client...');

        client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'sales-notification-agent',
                dataPath: './.wwebjs_auth' // Explicit path to store session
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });

        // Display QR code in terminal for authentication
        client.on('qr', (qr) => {
            console.log('\n📲 Scan this QR code with your WhatsApp:\n');
            qrcode.generate(qr, { small: true });
            console.log('\n');
        });

        // Client authenticated (session restored or QR scanned)
        client.on('authenticated', () => {
            console.log('✅ WhatsApp authenticated successfully');
        });

        // Client is ready to send messages
        client.on('ready', () => {
            isReady = true;
            console.log('🚀 WhatsApp client is ready!');
            resolve(client);
        });

        // Authentication failure
        client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
            isReady = false;
            // Don't reject, just log. We want the server to stay up.
        });

        // Client disconnected
        client.on('disconnected', (reason) => {
            console.log('🔌 WhatsApp client disconnected:', reason);
            isReady = false;
        });

        // Start the client with retry mechanism
        client.initialize().catch(err => {
            console.error('Failed to initialize WhatsApp client:', err);
            // If browser is already running, attempt cleanup
            if (err.message.includes('browser is already running')) {
                console.log('⚠️ Detected stale browser session, attempting cleanup...');
                // Destroy client and set to null to allow manual restart
                if (client) {
                    client.destroy().catch(() => {});
                    client = null;
                    isReady = false;
                }
            }
            // Don't reject main promise to allow server to start
            resolve(null);
        });
    });
}

/**
 * Cleanup WhatsApp client
 */
async function cleanup() {
    if (client) {
        try {
            await client.destroy();
            console.log('🧹 WhatsApp client cleaned up');
        } catch (err) {
            console.error('Error cleaning up WhatsApp client:', err.message);
        }
        client = null;
        isReady = false;
    }
}

/**
 * Check if WhatsApp client is ready
 * @returns {boolean}
 */
function isClientReady() {
    return isReady && client !== null;
}

/**
 * Format phone number to WhatsApp ID format
 * @param {string} phone - Phone number (with or without country code)
 * @returns {string} WhatsApp chat ID
 */
function formatPhoneNumber(phone) {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, assume Indian number and add 91
    if (cleaned.startsWith('0')) {
        cleaned = '91' + cleaned.substring(1);
    }
    
    // If doesn't have country code, assume India (91)
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    
    return `${cleaned}@c.us`;
}

/**
 * Send a WhatsApp message
 * @param {string} phone - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendMessage(phone, message) {
    if (!isClientReady()) {
        console.error('❌ WhatsApp client not connected');
        return {
            success: false,
            error: 'WhatsApp client not connected'
        };
    }

    try {
        const chatId = formatPhoneNumber(phone);
        console.log(`📤 Sending message to: ${chatId}`);
        
        const response = await client.sendMessage(chatId, message);
        
        console.log(`✅ Message sent successfully. ID: ${response.id._serialized}`);
        return {
            success: true,
            messageId: response.id._serialized
        };
    } catch (error) {
        console.error('❌ Failed to send message:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get WhatsApp client status
 * @returns {{connected: boolean, info: object|null}}
 */
function getStatus() {
    if (!isClientReady()) {
        return { connected: false, info: null };
    }
    
    return {
        connected: true,
        info: client.info || null
    };
}

module.exports = {
    initializeClient,
    isClientReady,
    sendMessage,
    getStatus,
    cleanup
};
