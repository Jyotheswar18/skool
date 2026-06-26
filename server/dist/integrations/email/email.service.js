"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../../config/env");
// Determine if SMTP is configured
const isSmtpConfigured = !!(env_1.env.SMTP_HOST && env_1.env.SMTP_USER && env_1.env.SMTP_PASS);
let transporter = null;
if (isSmtpConfigured) {
    transporter = nodemailer_1.default.createTransport({
        host: env_1.env.SMTP_HOST,
        port: parseInt(env_1.env.SMTP_PORT || '587', 10),
        secure: env_1.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: env_1.env.SMTP_USER,
            pass: env_1.env.SMTP_PASS,
        },
    });
    console.log('✅ SMTP Mailer initialized successfully.');
}
else {
    console.log('⚠️ SMTP credentials not fully configured. Email notifications will fall back to mock console logging.');
}
class EmailService {
}
exports.EmailService = EmailService;
_a = EmailService;
/**
 * Send an email
 */
EmailService.sendEmail = async (options) => {
    const fromAddress = env_1.env.SMTP_FROM || 'EduNest <noreply@edunest.com>';
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
        }
        catch (err) {
            console.error('SMTP email dispatch failure:', err);
            return { success: false, error: err.message };
        }
    }
    else {
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
//# sourceMappingURL=email.service.js.map