import mongoose, { Document } from 'mongoose';
export interface INotificationDocument extends Document {
    _id: mongoose.Types.ObjectId;
    type: 'onboarding' | 'fee_reminder' | 'fee_overdue' | 'attendance_alert' | 'event_broadcast';
    recipient: {
        name: string;
        phone: string;
        studentId?: mongoose.Types.ObjectId;
    };
    message: string;
    mediaUrls: string[];
    channel: 'whatsapp';
    status: 'queued' | 'sent' | 'delivered' | 'failed';
    errorMessage?: string;
    relatedEntity?: {
        type: 'student' | 'installment' | 'attendance' | 'event';
        id: mongoose.Types.ObjectId;
    };
    sentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotificationDocument, {}, {}, {}, mongoose.Document<unknown, {}, INotificationDocument, {}, mongoose.DefaultSchemaOptions> & INotificationDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotificationDocument>;
//# sourceMappingURL=notification.model.d.ts.map