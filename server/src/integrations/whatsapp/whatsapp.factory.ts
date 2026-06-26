import { IWhatsAppAdapter } from './whatsapp.interface';
import { MockWhatsAppAdapter } from './mock.adapter';
import { WatiWhatsAppAdapter } from './wati.adapter';
import { env } from '../../config/env';

export class WhatsAppFactory {
  private static instance: IWhatsAppAdapter;

  static getAdapter(): IWhatsAppAdapter {
    if (this.instance) {
      return this.instance;
    }

    const provider = env.WHATSAPP_PROVIDER;
    const apiKey = env.WHATSAPP_API_KEY || '';
    const apiUrl = env.WHATSAPP_API_URL || '';

    switch (provider) {
      case 'wati':
        this.instance = new WatiWhatsAppAdapter(apiKey, apiUrl);
        break;
      case 'mock':
      default:
        this.instance = new MockWhatsAppAdapter();
        break;
    }

    console.log(`🔌 WhatsApp Notification system initialized with provider: [${provider}]`);
    return this.instance;
  }
}
