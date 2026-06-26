export interface SendMessageOptions {
    phone: string;
    message: string;
    templateName?: string;
    templateVariables?: Record<string, string>;
    mediaUrls?: string[];
}
export interface IWhatsAppAdapter {
    sendMessage(options: SendMessageOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
//# sourceMappingURL=whatsapp.interface.d.ts.map