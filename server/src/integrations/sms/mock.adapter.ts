import { ISMSAdapter, SendSMSOptions } from './sms.interface';

export class MockSMSAdapter implements ISMSAdapter {
  async sendMessage(options: SendSMSOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
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
