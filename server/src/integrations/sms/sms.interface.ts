export interface SendSMSOptions {
  phone: string;
  message: string;
}

export interface ISMSAdapter {
  sendMessage(options: SendSMSOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
}
