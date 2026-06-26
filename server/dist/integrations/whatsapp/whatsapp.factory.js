"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppFactory = void 0;
const mock_adapter_1 = require("./mock.adapter");
const wati_adapter_1 = require("./wati.adapter");
const env_1 = require("../../config/env");
class WhatsAppFactory {
    static getAdapter(provider, apiKey, apiUrl) {
        const activeProvider = provider || env_1.env.WHATSAPP_PROVIDER;
        const activeApiKey = apiKey !== undefined ? apiKey : (env_1.env.WHATSAPP_API_KEY || '');
        const activeApiUrl = apiUrl !== undefined ? apiUrl : (env_1.env.WHATSAPP_API_URL || '');
        switch (activeProvider) {
            case 'wati':
                return new wati_adapter_1.WatiWhatsAppAdapter(activeApiKey, activeApiUrl);
            case 'mock':
            default:
                return new mock_adapter_1.MockWhatsAppAdapter();
        }
    }
}
exports.WhatsAppFactory = WhatsAppFactory;
//# sourceMappingURL=whatsapp.factory.js.map