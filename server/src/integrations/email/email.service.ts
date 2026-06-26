import nodemailer from 'nodemailer';
import { env } from '../../config/env';

// Determine if SMTP is configured
const isSmtpConfigured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

let transporter: nodemailer.Transporter | null = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587', 10),
    secure: env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  console.log('✅ SMTP Mailer initialized successfully.');
} else {
  console.log('⚠️ SMTP credentials not fully configured. Email notifications will fall back to mock console logging.');
}

export class EmailService {
  /**
   * Send an email
   */
  static sendEmail = async (options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    attachments?: { filename: string; path: string }[];
  }): Promise<{ success: boolean; error?: string }> => {
    const fromAddress = env.SMTP_FROM || 'EduNest <noreply@edunest.com>';

    if (isSmtpConfigured && transporter) {
      try {
        const info = await transporter.sendMail({
          from: fromAddress,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
          attachments: options.attachments,
        });
        console.log(`✉️ Email sent successfully: ${info.messageId}`);
        return { success: true };
      } catch (err: any) {
        console.error('SMTP email dispatch failure:', err);
        return { success: false, error: err.message };
      }
    } else {
      // Mock logger
      console.log('\n================= MOCK EMAIL =================');
      console.log(`FROM: ${fromAddress}`);
      console.log(`TO: ${options.to}`);
      console.log(`SUBJECT: ${options.subject}`);
      console.log(`MESSAGE:\n${options.text}`);
      if (options.attachments && options.attachments.length > 0) {
        console.log(`ATTACHMENTS: ${options.attachments.map((a) => a.filename).join(', ')}`);
      }
      console.log('==============================================\n');
      return { success: true };
    }
  };
}
