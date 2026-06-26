import { IWhatsAppAdapter, SendMessageOptions } from './whatsapp.interface';
export declare class WatiWhatsAppAdapter implements IWhatsAppAdapter {
    private apiKey;
    private apiUrl;
    constructor(apiKey: string, apiUrl: string);
    sendMessage(options: SendMessageOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
//# sourceMappingURL=wati.adapter.d.ts.map