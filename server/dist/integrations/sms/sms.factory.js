"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSFactory = void 0;
const mock_adapter_1 = require("./mock.adapter");
const twilio_adapter_1 = require("./twilio.adapter");
const env_1 = require("../../config/env");
class SMSFactory {
    static getAdapter(provider, apiKey, apiUrl, senderNumber) {
        const activeProvider = provider || env_1.env.SMS_PROVIDER;
        const activeApiKey = apiKey !== undefined ? apiKey : (env_1.env.SMS_API_KEY || '');
        const activeApiUrl = apiUrl !== undefined ? apiUrl : (env_1.env.SMS_API_URL || '');
        const activeSenderNumber = senderNumber !== undefined ? senderNumber : (env_1.env.SMS_SENDER_NUMBER || '');
        switch (activeProvider) {
            case 'twilio':
                // apiUrl holds the Twilio Account SID, apiKey holds Twilio Auth Token
                return new twilio_adapter_1.TwilioSMSAdapter(activeApiUrl, activeApiKey, activeSenderNumber);
            case 'mock':
            default:
                return new mock_adapter_1.MockSMSAdapter();
        }
    }
}
exports.SMSFactory = SMSFactory;
//# sourceMappingURL=sms.factory.js.map