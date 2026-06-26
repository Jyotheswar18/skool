import mongoose from 'mongoose';
export declare class NotificationService {
    /**
     * General-purpose notification sender & logger
     */
    static sendNotification: (options: {
        type: "onboarding" | "fee_reminder" | "fee_overdue" | "attendance_alert" | "event_broadcast";
        recipientName: string;
        recipientPhone: string;
        studentId?: string;
        message: string;
        mediaUrls?: string[];
        relatedEntity?: {
            type: "student" | "installment" | "attendance" | "event";
            id: string;
        };
        templateName?: string;
        templateVariables?: Record<string, string>;
    }) => Promise<mongoose.Document<unknown, {}, import("./notification.model").INotificationDocument, {}, mongoose.DefaultSchemaOptions> & import("./notification.model").INotificationDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    /**
     * Sends welcome onboarding message to parent
     */
    static sendWelcomeMessage: (studentName: string, studentClass: string, studentSection: string, totalFee: number, installmentsCount: number, parentName: string, parentMobile: string, studentId: string) => Promise<mongoose.Document<unknown, {}, import("./notification.model").INotificationDocument, {}, mongoose.DefaultSchemaOptions> & import("./notification.model").INotificationDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    /**
     * Sends attendance alert for absent students
     */
    static sendAbsentAlert: (studentName: string, studentClass: string, studentSection: string, parentName: string, parentMobile: string, dateStr: string, studentId: string, attendanceId: string) => Promise<mongoose.Document<unknown, {}, import("./notification.model").INotificationDocument, {}, mongoose.DefaultSchemaOptions> & import("./notification.model").INotificationDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    /**
     * Sends fee reminders
     */
    static sendFeeReminder: (options: {
        studentName: string;
        parentName: string;
        parentMobile: string;
        studentId: string;
        installmentId: string;
        amount: number;
        dueDateStr: string;
        installmentNumber: number;
        reminderType: "upcoming" | "due_today" | "overdue";
        daysOverdue?: number;
    }) => Promise<mongoose.Document<unknown, {}, import("./notification.model").INotificationDocument, {}, mongoose.DefaultSchemaOptions> & import("./notification.model").INotificationDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    /**
     * Broadcasts event publication to target parents
     */
    static sendEventBroadcast: (options: {
        eventTitle: string;
        description: string;
        parentName: string;
        parentMobile: string;
        studentId: string;
        eventId: string;
        mediaUrl?: string;
    }) => Promise<mongoose.Document<unknown, {}, import("./notification.model").INotificationDocument, {}, mongoose.DefaultSchemaOptions> & import("./notification.model").INotificationDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
//# sourceMappingURL=notification.service.d.ts.map