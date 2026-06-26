export declare class EmailService {
    /**
     * Send an email
     */
    static sendEmail: (options: {
        to: string;
        subject: string;
        text: string;
        html?: string;
        attachments?: {
            filename: string;
            path: string;
        }[];
    }) => Promise<{
        success: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=email.service.d.ts.map