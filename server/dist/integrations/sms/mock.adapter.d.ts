import { ISMSAdapter, SendSMSOptions } from './sms.interface';
export declare class MockSMSAdapter implements ISMSAdapter {
    sendMessage(options: SendSMSOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
//# sourceMappingURL=mock.adapter.d.ts.map