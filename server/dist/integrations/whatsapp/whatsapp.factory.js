"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppFactory = void 0;
const mock_adapter_1 = require("./mock.adapter");
const wati_adapter_1 = require("./wati.adapter");
const env_1 = require("../../config/env");
class WhatsAppFactory {
    static getAdapter() {
        if (this.instance) {
            return this.instance;
        }
        const provider = env_1.env.WHATSAPP_PROVIDER;
        const apiKey = env_1.env.WHATSAPP_API_KEY || '';
        const apiUrl = env_1.env.WHATSAPP_API_URL || '';
        switch (provider) {
            case 'wati':
                this.instance = new wati_adapter_1.WatiWhatsAppAdapter(apiKey, apiUrl);
                break;
            case 'mock':
            default:
                this.instance = new mock_adapter_1.MockWhatsAppAdapter();
                break;
        }
        console.log(`🔌 WhatsApp Notification system initialized with provider: [${provider}]`);
        return this.instance;
    }
}
exports.WhatsAppFactory = WhatsAppFactory;
//# sourceMappingURL=whatsapp.factory.js.map