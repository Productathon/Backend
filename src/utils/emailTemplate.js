/**
 * Email Template Utility
 * Formats lead data into professional HTML email notifications
 */

/**
 * Format lead data into HTML email content
 * @param {object} lead - Lead data object
 * @returns {{html: string, text: string, subject: string}}
 */
function formatEmailNotification(lead) {
    const {
        companyName = 'N/A',
        industry = 'N/A',
        location = 'N/A',
        suggestedProduct = 'N/A',
        priority = 'HIGH',
        reason = 'No additional details provided.',
        salesOfficer = {}
    } = lead;

    const subject = `🚨 High-Priority Lead: ${companyName}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Lead Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 25px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🚨 New High-Priority Lead</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 30px;">
                <!-- Lead Details -->
                <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                    <tr>
                        <td style="border-bottom: 1px solid #e9ecef;">
                            <strong style="color: #666;">🏭 Company</strong><br>
                            <span style="font-size: 18px; color: #333;">${companyName}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #e9ecef;">
                            <strong style="color: #666;">🏢 Industry</strong><br>
                            <span style="color: #333;">${industry}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #e9ecef;">
                            <strong style="color: #666;">📍 Location</strong><br>
                            <span style="color: #333;">${location}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #e9ecef;">
                            <strong style="color: #666;">🛢 Suggested Product</strong><br>
                            <span style="color: #333;">${suggestedProduct}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <strong style="color: #666;">⭐ Priority</strong><br>
                            <span style="display: inline-block; background-color: #e74c3c; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">${priority}</span>
                        </td>
                    </tr>
                </table>

                <!-- Reason -->
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                    <strong style="color: #856404;">📌 Lead Intelligence:</strong>
                    <p style="margin: 10px 0 0 0; color: #856404;">${reason}</p>
                </div>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="text-align: center; padding: 20px 0;">
                            <a href="#" style="display: inline-block; background-color: #3498db; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                Open Sales App →
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #2c3e50; padding: 20px; text-align: center;">
                <p style="color: #bdc3c7; margin: 0; font-size: 12px;">
                    B2B Sales Intelligence System<br>
                    This is an automated notification. Do not reply.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>`;

    // Plain text fallback
    const text = `🚨 NEW HIGH-PRIORITY LEAD DETECTED

🏭 Company: ${companyName}
🏢 Industry: ${industry}
📍 Location: ${location}
🛢 Suggested Product: ${suggestedProduct}
⭐ Priority: ${priority}

📌 Reason:
${reason}

👉 Please open the Sales App for full lead details.

---
B2B Sales Intelligence System`;

    return { html, text, subject };
}

module.exports = {
    formatEmailNotification
};
