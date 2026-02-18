const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.INFOBIP_API_KEY;
const baseUrl = process.env.INFOBIP_BASE_URL;
const appId = process.env.INFOBIP_2FA_APP_ID;
const messageId = process.env.INFOBIP_2FA_MESSAGE_ID;

/**
 * Sends a 2FA PIN code using Infobip.
 * @param {string} to - Receiver's phone number (with country code, e.g., 919876543210).
 * @returns {Promise<string|null>} - Returns pinId on success, null on failure.
 */
const sendOTP = async (to) => {
    const cleanTo = to.replace("+", "");

    try {
        const response = await axios.post(
            `https://${baseUrl}/2fa/2/pin`,
            {
                applicationId: appId,
                messageId: messageId,
                from: "ServiceSMS",
                to: cleanTo,
            },
            {
                headers: {
                    Authorization: `App ${apiKey}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        if (response.status === 200) {
            console.log(`Infobip 2FA: PIN sent successfully to ${to}. PinId: ${response.data.pinId}`);
            return response.data.pinId;
        } else {
            console.error("Infobip 2FA Error:", response.data);
            return null;
        }
    } catch (error) {
        console.error("Error sending 2FA PIN via Infobip:", error.response ? error.response.data : error.message);
        return null;
    }
};

/**
 * Verifies a 2FA PIN code using Infobip.
 * @param {string} pinId - The ID of the pin sent.
 * @param {string} pin - The pin code entered by the user.
 * @returns {Promise<boolean>} - Returns true if verified, false otherwise.
 */
const verifyOTP = async (pinId, pin) => {
    try {
        const response = await axios.post(
            `https://${baseUrl}/2fa/2/pin/${pinId}/verify`,
            { pin: pin },
            {
                headers: {
                    Authorization: `App ${apiKey}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        if (response.status === 200 && response.data.verified) {
            console.log(`Infobip 2FA: PIN verified successfully.`);
            return true;
        } else {
            console.error("Infobip 2FA Verification Failed:", response.data);
            return false;
        }
    } catch (error) {
        console.error("Error verifying 2FA PIN via Infobip:", error.response ? error.response.data : error.message);
        return false;
    }
};

module.exports = { sendOTP, verifyOTP };
