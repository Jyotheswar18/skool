import axios from 'axios';
import { IWhatsAppAdapter, SendMessageOptions } from './whatsapp.interface';

export class WatiWhatsAppAdapter implements IWhatsAppAdapter {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async sendMessage(options: SendMessageOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apiKey || !this.apiUrl) {
      console.warn('⚠️ WATI credentials missing. Falling back to console logging.');
      console.log(`[WATI MOCK] To: ${options.phone}, Message: ${options.message}`);
      return { success: true, messageId: `wati-mock-id-${Date.now()}` };
    }

    try {
      // WATI Template messaging API endpoint
      // Example endpoint: https://api.wati.io/api/v1/sendTemplateMessage
      const response = await axios.post(
        `${this.apiUrl}/api/v1/sendTemplateMessage?whatsappNumber=${options.phone}`,
        {
          templateName: options.templateName,
          broadcastName: `edunest_${options.templateName || 'custom'}`,
          parameters: Object.entries(options.templateVariables || {}).map(([name, value]) => ({
            name,
            value,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.result) {
        return {
          success: true,
          messageId: response.data.id,
        };
      }

      return {
        success: false,
        error: response.data.info || 'Failed to send template message via WATI',
      };
    } catch (error: any) {
      console.error('❌ WATI API error:', error.message || error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'WATI API Error',
      };
    }
  }
}
