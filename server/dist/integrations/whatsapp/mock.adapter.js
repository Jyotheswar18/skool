"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockWhatsAppAdapter = void 0;
class MockWhatsAppAdapter {
    async sendMessage(options) {
        console.log(`[MOCK WHATSAPP] Sending message to ${options.phone}:`);
        console.log(`Message: ${options.message}`);
        if (options.templateName) {
            console.log(`Template: ${options.templateName} with vars:`, options.templateVariables);
        }
        if (options.mediaUrls && options.mediaUrls.length > 0) {
            console.log(`Media URLs:`, options.mediaUrls);
        }
        // Simulate latency
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
            success: true,
            messageId: `mock-msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        };
    }
}
exports.MockWhatsAppAdapter = MockWhatsAppAdapter;
//# sourceMappingURL=mock.adapter.js.map