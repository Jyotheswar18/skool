"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSMSAdapter = void 0;
class MockSMSAdapter {
    async sendMessage(options) {
        console.log(`[MOCK SMS] Sending SMS to ${options.phone}:`);
        console.log(`Message: ${options.message}`);
        // Simulate latency
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
            success: true,
            messageId: `mock-sms-id-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        };
    }
}
exports.MockSMSAdapter = MockSMSAdapter;
//# sourceMappingURL=mock.adapter.js.map