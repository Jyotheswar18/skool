import { ISMSAdapter } from './sms.interface';
import { MockSMSAdapter } from './mock.adapter';
import { TwilioSMSAdapter } from './twilio.adapter';
import { env } from '../../config/env';

export class SMSFactory {
  static getAdapter(provider?: string, apiKey?: string, apiUrl?: string, senderNumber?: string): ISMSAdapter {
    const activeProvider = provider || env.SMS_PROVIDER;
    const activeApiKey = apiKey !== undefined ? apiKey : (env.SMS_API_KEY || '');
    const activeApiUrl = apiUrl !== undefined ? apiUrl : (env.SMS_API_URL || '');
    const activeSenderNumber = senderNumber !== undefined ? senderNumber : (env.SMS_SENDER_NUMBER || '');

    switch (activeProvider) {
      case 'twilio':
        // apiUrl holds the Twilio Account SID, apiKey holds Twilio Auth Token
        return new TwilioSMSAdapter(activeApiUrl, activeApiKey, activeSenderNumber);
      case 'mock':
      default:
        return new MockSMSAdapter();
    }
  }
}
