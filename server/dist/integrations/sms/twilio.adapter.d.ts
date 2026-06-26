import { ISMSAdapter, SendSMSOptions } from './sms.interface';
export declare class TwilioSMSAdapter implements ISMSAdapter {
    private accountSid;
    private authToken;
    private senderNumber;
    constructor(accountSid: string, authToken: string, senderNumber: string);
    sendMessage(options: SendSMSOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
//# sourceMappingURL=twilio.adapter.d.ts.map