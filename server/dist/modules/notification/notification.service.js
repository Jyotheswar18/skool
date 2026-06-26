"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notification_model_1 = require("./notification.model");
const sms_factory_1 = require("../../integrations/sms/sms.factory");
const config_service_1 = require("../schoolConfig/config.service");
const email_service_1 = require("../../integrations/email/email.service");
class NotificationService {
}
exports.NotificationService = NotificationService;
_a = NotificationService;
/**
 * General-purpose notification sender & logger (supports Email and SMS)
 */
NotificationService.sendNotification = async (options) => {
    const isEmailDispatch = !!options.recipientEmail;
    const notif = await notification_model_1.Notification.create({
        type: options.type,
        recipient: {
            name: options.recipientName,
            phone: options.recipientPhone,
            email: options.recipientEmail,
            studentId: options.studentId ? new mongoose_1.default.Types.ObjectId(options.studentId) : undefined,
        },
        message: options.message,
        mediaUrls: options.mediaUrls || [],
        channel: isEmailDispatch ? 'email' : 'sms',
        status: 'queued',
        relatedEntity: options.relatedEntity
            ? {
                type: options.relatedEntity.type,
                id: new mongoose_1.default.Types.ObjectId(options.relatedEntity.id),
            }
            : undefined,
    });
    if (isEmailDispatch) {
        // Determine Subject based on type
        let subject = 'EduNest Notification';
        if (options.type === 'onboarding') {
            subject = 'Welcome to EduNest!';
        }
        else if (options.type === 'fee_reminder' || options.type === 'fee_overdue') {
            subject = `EduNest Alert: Fee Reminder`;
        }
        else if (options.type === 'attendance_alert') {
            const isAbsent = options.templateVariables?.status === 'absent';
            subject = isAbsent
                ? `EduNest Alert: Student Absent Notification`
                : `EduNest Alert: Student Attendance Check-in`;
        }
        else if (options.type === 'event_broadcast') {
            subject = `EduNest Announcement: ${options.templateVariables?.eventTitle || 'New Event'}`;
        }
        // Generate HTML email content with embedded media if available
        const formattedMessage = options.message.replace(/\n/g, '<br/>');
        let mediaHtml = '';
        if (options.mediaUrls && options.mediaUrls.length > 0) {
            mediaHtml = '<div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px;">';
            for (const url of options.mediaUrls) {
                if (url) {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                    if (isImage) {
                        mediaHtml += `
                <div style="margin-bottom: 15px; text-align: center;">
                  <img src="${url}" alt="Event Media" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
                </div>`;
                    }
                    else {
                        mediaHtml += `
                <div style="margin-bottom: 10px; text-align: center;">
                  <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;" target="_blank">
                    View Attached File / Media
                  </a>
                </div>`;
                    }
                }
            }
            mediaHtml += '</div>';
        }
        const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="color: #4f46e5; font-size: 24px; margin: 0; font-weight: 700;">EduNest</h1>
            <span style="font-size: 12px; color: #64748b; font-weight: 500;">School Management System</span>
          </div>
          <div style="color: #334155; font-size: 15px; line-height: 1.6;">
            ${formattedMessage}
          </div>
          ${mediaHtml}
          <div style="margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
            This is an automated notification from EduNest. Please do not reply to this email.
          </div>
        </div>
      `;
        const attachments = [];
        if (options.mediaUrls && options.mediaUrls.length > 0) {
            for (const url of options.mediaUrls) {
                if (url) {
                    const filename = url.substring(url.lastIndexOf('/') + 1) || 'attachment';
                    attachments.push({
                        filename,
                        path: url,
                    });
                }
            }
        }
        try {
            const result = await email_service_1.EmailService.sendEmail({
                to: options.recipientEmail,
                subject,
                text: options.message,
                html: htmlContent,
                attachments,
            });
            if (result.success) {
                notif.status = 'sent';
                notif.sentAt = new Date();
            }
            else {
                notif.status = 'failed';
                notif.errorMessage = result.error || 'Unknown SMTP error';
            }
        }
        catch (err) {
            notif.status = 'failed';
            notif.errorMessage = err.message || 'System error during email dispatch';
        }
    }
    else {
        // Existing SMS Dispatch Flow
        const config = await config_service_1.ConfigService.getConfig();
        const smsEnabled = config.sms?.enabled !== false;
        const provider = smsEnabled ? config.sms?.provider : 'mock';
        const apiKey = smsEnabled ? config.sms?.apiKey : '';
        const apiUrl = smsEnabled ? config.sms?.apiUrl : '';
        const senderNumber = smsEnabled ? config.sms?.senderNumber : '';
        const sms = sms_factory_1.SMSFactory.getAdapter(provider, apiKey, apiUrl, senderNumber);
        try {
            const result = await sms.sendMessage({
                phone: options.recipientPhone,
                message: options.message,
            });
            if (result.success) {
                notif.status = 'sent';
                notif.sentAt = new Date();
            }
            else {
                notif.status = 'failed';
                notif.errorMessage = result.error || 'Unknown SMS API error';
            }
        }
        catch (err) {
            notif.status = 'failed';
            notif.errorMessage = err.message || 'System error during SMS dispatch';
        }
    }
    await notif.save();
    return notif;
};
/**
 * Sends welcome onboarding message to parent
 */
NotificationService.sendWelcomeMessage = async (studentName, studentClass, studentSection, totalFee, installmentsCount, parentName, parentMobile, studentId, parentEmail) => {
    const message = `Hello ${parentName},\n\nWelcome to EduNest! Your child ${studentName} has been successfully registered in Class ${studentClass}-${studentSection}.\n\nFee Details:\nTotal Academic Fee: ₹${totalFee}\nInstallments: ${installmentsCount}\n\nYou will receive fee reminders and updates regularly.\n\nWarm regards,\nEduNest Administration`;
    return _a.sendNotification({
        type: 'onboarding',
        recipientName: parentName,
        recipientPhone: parentMobile,
        recipientEmail: parentEmail,
        studentId,
        message,
        relatedEntity: { type: 'student', id: studentId },
        templateName: 'student_welcome',
        templateVariables: {
            parentName,
            studentName,
            class: studentClass,
            section: studentSection,
            totalFee: String(totalFee),
            installments: String(installmentsCount),
        },
    });
};
/**
 * Sends attendance alert for absent students (Wrapper for backwards compatibility)
 */
NotificationService.sendAbsentAlert = async (studentName, studentClass, studentSection, parentName, parentMobile, dateStr, studentId, attendanceId, parentEmail) => {
    return _a.sendAttendanceAlert(studentName, studentClass, studentSection, parentName, parentMobile, dateStr, 'N/A', 'absent', studentId, attendanceId, parentEmail);
};
/**
 * Sends attendance alert to parent (for present, late, or absent status)
 */
NotificationService.sendAttendanceAlert = async (studentName, studentClass, studentSection, parentName, parentMobile, dateStr, timeStr, status, studentId, attendanceId, parentEmail) => {
    let message = '';
    if (status === 'absent') {
        message = `Dear Parent,\n\nPlease note that your student ${studentName} is absent on this day (${dateStr}).\n\nRegards,\nEduNest`;
    }
    else {
        message = `Dear Parent,\n\nPlease note that the student ${studentName} has registered attendance on this day (${dateStr}) and at this time (${timeStr}).\n\nRegards,\nEduNest`;
    }
    return _a.sendNotification({
        type: 'attendance_alert',
        recipientName: parentName,
        recipientPhone: parentMobile,
        recipientEmail: parentEmail,
        studentId,
        message,
        relatedEntity: { type: 'attendance', id: attendanceId },
        templateName: status === 'absent' ? 'attendance_absent' : 'attendance_present',
        templateVariables: {
            parentName,
            studentName,
            class: studentClass,
            section: studentSection,
            date: dateStr,
            time: timeStr,
            status,
        },
    });
};
/**
 * Sends fee reminders
 */
NotificationService.sendFeeReminder = async (options) => {
    let message = '';
    let type = 'fee_reminder';
    let templateName = '';
    if (options.reminderType === 'upcoming') {
        message = `Dear ${options.parentName},\n\nThis is a friendly reminder that Installment #${options.installmentNumber} of ₹${options.amount} for your child ${options.studentName} is due in 3 days on ${options.dueDateStr}.\n\nPlease ignore if already paid.\n\nRegards,\nEduNest`;
        templateName = 'fee_upcoming';
    }
    else if (options.reminderType === 'due_today') {
        message = `Dear ${options.parentName},\n\nPlease note that Installment #${options.installmentNumber} of ₹${options.amount} for your child ${options.studentName} is due TODAY (${options.dueDateStr}).\n\nKindly clear the dues at the earliest.\n\nRegards,\nEduNest`;
        templateName = 'fee_due_today';
    }
    else {
        type = 'fee_overdue';
        message = `URGENT: Dear ${options.parentName},\n\nInstallment #${options.installmentNumber} of ₹${options.amount} for your child ${options.studentName} was due on ${options.dueDateStr} and is now OVERDUE by ${options.daysOverdue || 0} days.\n\nKindly clear this immediately to avoid any inconvenience.\n\nRegards,\nEduNest`;
        templateName = 'fee_overdue';
    }
    return _a.sendNotification({
        type,
        recipientName: options.parentName,
        recipientPhone: options.parentMobile,
        recipientEmail: options.parentEmail,
        studentId: options.studentId,
        message,
        relatedEntity: { type: 'installment', id: options.installmentId },
        templateName,
        templateVariables: {
            parentName: options.parentName,
            studentName: options.studentName,
            amount: String(options.amount),
            dueDate: options.dueDateStr,
            installmentNo: String(options.installmentNumber),
            ...(options.daysOverdue !== undefined && { daysOverdue: String(options.daysOverdue) }),
        },
    });
};
/**
 * Broadcasts event publication to target parents
 */
NotificationService.sendEventBroadcast = async (options) => {
    const message = `Hello ${options.parentName},\n\nEduNest has shared updates about an event: "${options.eventTitle}"!\n\nDescription: ${options.description}\n\nView details and media on the school portal.\n\nRegards,\nEduNest`;
    return _a.sendNotification({
        type: 'event_broadcast',
        recipientName: options.parentName,
        recipientPhone: options.parentMobile,
        recipientEmail: options.parentEmail,
        studentId: options.studentId,
        message,
        mediaUrls: options.mediaUrls || [],
        relatedEntity: { type: 'event', id: options.eventId },
        templateName: 'event_broadcast',
        templateVariables: {
            parentName: options.parentName,
            eventTitle: options.eventTitle,
            description: options.description,
            mediaUrl: options.mediaUrls && options.mediaUrls.length > 0 ? options.mediaUrls[0] : '',
        },
    });
};
//# sourceMappingURL=notification.service.js.map