"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notification_model_1 = require("./notification.model");
const whatsapp_factory_1 = require("../../integrations/whatsapp/whatsapp.factory");
class NotificationService {
}
exports.NotificationService = NotificationService;
_a = NotificationService;
/**
 * General-purpose notification sender & logger
 */
NotificationService.sendNotification = async (options) => {
    // 1. Create a queued notification in the database
    const notif = await notification_model_1.Notification.create({
        type: options.type,
        recipient: {
            name: options.recipientName,
            phone: options.recipientPhone,
            studentId: options.studentId ? new mongoose_1.default.Types.ObjectId(options.studentId) : undefined,
        },
        message: options.message,
        mediaUrls: options.mediaUrls || [],
        channel: 'whatsapp',
        status: 'queued',
        relatedEntity: options.relatedEntity
            ? {
                type: options.relatedEntity.type,
                id: new mongoose_1.default.Types.ObjectId(options.relatedEntity.id),
            }
            : undefined,
    });
    // 2. Dispatch via WhatsApp Adapter
    const whatsapp = whatsapp_factory_1.WhatsAppFactory.getAdapter();
    try {
        const result = await whatsapp.sendMessage({
            phone: options.recipientPhone,
            message: options.message,
            templateName: options.templateName,
            templateVariables: options.templateVariables,
            mediaUrls: options.mediaUrls,
        });
        if (result.success) {
            notif.status = 'sent';
            notif.sentAt = new Date();
        }
        else {
            notif.status = 'failed';
            notif.errorMessage = result.error || 'Unknown WhatsApp API error';
        }
    }
    catch (err) {
        notif.status = 'failed';
        notif.errorMessage = err.message || 'System error during dispatch';
    }
    await notif.save();
    return notif;
};
/**
 * Sends welcome onboarding message to parent
 */
NotificationService.sendWelcomeMessage = async (studentName, studentClass, studentSection, totalFee, installmentsCount, parentName, parentMobile, studentId) => {
    const message = `Hello ${parentName},\n\nWelcome to EduNest! Your child ${studentName} has been successfully registered in Class ${studentClass}-${studentSection}.\n\nFee Details:\nTotal Academic Fee: ₹${totalFee}\nInstallments: ${installmentsCount}\n\nYou will receive fee reminders and updates regularly.\n\nWarm regards,\nEduNest Administration`;
    return _a.sendNotification({
        type: 'onboarding',
        recipientName: parentName,
        recipientPhone: parentMobile,
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
 * Sends attendance alert for absent students
 */
NotificationService.sendAbsentAlert = async (studentName, studentClass, studentSection, parentName, parentMobile, dateStr, studentId, attendanceId) => {
    const message = `Dear Parent,\n\nPlease note that your child ${studentName} (Class ${studentClass}-${studentSection}) was marked ABSENT today (${dateStr}).\n\nIf this was not planned, please contact the class teacher.\n\nRegards,\nEduNest`;
    return _a.sendNotification({
        type: 'attendance_alert',
        recipientName: parentName,
        recipientPhone: parentMobile,
        studentId,
        message,
        relatedEntity: { type: 'attendance', id: attendanceId },
        templateName: 'attendance_absent',
        templateVariables: {
            parentName,
            studentName,
            class: studentClass,
            section: studentSection,
            date: dateStr,
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
        studentId: options.studentId,
        message,
        mediaUrls: options.mediaUrl ? [options.mediaUrl] : [],
        relatedEntity: { type: 'event', id: options.eventId },
        templateName: 'event_broadcast',
        templateVariables: {
            parentName: options.parentName,
            eventTitle: options.eventTitle,
            description: options.description,
            mediaUrl: options.mediaUrl || '',
        },
    });
};
//# sourceMappingURL=notification.service.js.map