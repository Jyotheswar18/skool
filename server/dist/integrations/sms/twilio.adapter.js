"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSMSAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
class TwilioSMSAdapter {
    constructor(accountSid, authToken, senderNumber) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.senderNumber = senderNumber;
    }
    async sendMessage(options) {
        if (!this.accountSid || !this.authToken || !this.senderNumber) {
            console.error('❌ Twilio SMS credentials missing.');
            return {
                success: false,
                error: 'Twilio credentials are not configured in Settings. Please fill in your Account SID, Auth Token, and Sender Number.'
            };
        }
        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
            // Format number to E.164 (prepend +91 if 10 digit number)
            let recipientPhone = options.phone.trim();
            if (/^\d{10}$/.test(recipientPhone)) {
                recipientPhone = `+91${recipientPhone}`;
            }
            else if (!recipientPhone.startsWith('+')) {
                recipientPhone = `+${recipientPhone}`;
            }
            // Twilio expects Form URL Encoded payload
            const params = new URLSearchParams();
            params.append('To', recipientPhone);
            params.append('From', this.senderNumber);
            params.append('Body', options.message);
            const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
            const response = await axios_1.default.post(url, params.toString(), {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data && response.data.sid) {
                return {
                    success: true,
                    messageId: response.data.sid,
                };
            }
            return {
                success: false,
                error: 'Failed to send SMS via Twilio',
            };
        }
        catch (error) {
            console.error('❌ Twilio SMS API error:', error.message || error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Twilio SMS API Error',
            };
        }
    }
}
exports.TwilioSMSAdapter = TwilioSMSAdapter;
//# sourceMappingURL=twilio.adapter.js.map