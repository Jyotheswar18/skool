import { IWhatsAppAdapter, SendMessageOptions } from './whatsapp.interface';
export declare class MockWhatsAppAdapter implements IWhatsAppAdapter {
    sendMessage(options: SendMessageOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
//# sourceMappingURL=mock.adapter.d.ts.map