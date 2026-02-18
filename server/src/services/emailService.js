const { EmailClient } = require("@azure/communication-email");
require("dotenv").config();

const connectionString = process.env.AZURE_EMAIL_CONNECTION_STRING;
const senderAddress = process.env.AZURE_EMAIL_SENDER;

const emailClient = connectionString ? new EmailClient(connectionString) : null;

/**
 * Sends an OTP email using Azure Communication Services.
 * @param {string} to - Receiver's email address.
 * @param {string} otp - The 6-digit code.
 * @returns {Promise<boolean>}
 */
const sendEmailOTP = async (to, otp) => {
    if (!emailClient) {
        console.error("Azure Email Connection String not found in .env");
        return false;
    }

    const emailMessage = {
        senderAddress: senderAddress,
        content: {
            subject: "Your Pixland.ai by Rishi Parsad Verification Code",
            plainText: `Welcome to Pixland! Your verification code is: ${otp}. This code is valid for 5 minutes.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4f46e5;">Welcome to PixLand</h2>
                    <p>Both your email and mobile are being verified. Please use the following code to complete your registration:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #4f46e5; margin: 20px 0;">${otp}</div>
                    <p>This code is valid for 5 minutes.</p>
                    <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                </div>
            `,
        },
        recipients: {
            to: [{ address: to }],
        },
    };

    try {
        console.log(`[EmailService] Attempting to send OTP to ${to} from ${senderAddress}...`);
        if (!senderAddress) throw new Error("AZURE_EMAIL_SENDER is missing");

        const poller = await emailClient.beginSend(emailMessage);
        const result = await poller.pollUntilDone();
        console.log(`[EmailService] Success! MessageId: ${result.id}`);
        return true;
    } catch (error) {
        console.error("[EmailService] Azure Error Detail:", error);
        console.log(`[EmailService] FALLBACK: OTP for ${to} is: ${otp}`);
        // Return false to show error in UI, but we logged it for dev!
        return false;
    }
};

module.exports = { sendEmailOTP };
