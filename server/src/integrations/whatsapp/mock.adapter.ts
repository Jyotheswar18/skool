import { IWhatsAppAdapter, SendMessageOptions } from './whatsapp.interface';

export class MockWhatsAppAdapter implements IWhatsAppAdapter {
  async sendMessage(options: SendMessageOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
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
