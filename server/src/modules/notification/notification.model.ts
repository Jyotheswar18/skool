import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  type: 'onboarding' | 'fee_reminder' | 'fee_overdue' | 'attendance_alert' | 'event_broadcast' | 'marks_upload';
  recipient: {
    name: string;
    phone: string;
    email?: string;
    studentId?: mongoose.Types.ObjectId;
  };
  message: string;
  mediaUrls: string[];
  channel: 'sms' | 'email';
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  errorMessage?: string;
  relatedEntity?: {
    type: 'student' | 'installment' | 'attendance' | 'event' | 'marks';
    id: mongoose.Types.ObjectId;
  };
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    type: {
      type: String,
      enum: ['onboarding', 'fee_reminder', 'fee_overdue', 'attendance_alert', 'event_broadcast', 'marks_upload'],
      required: true,
    },
    recipient: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    },
    message: {
      type: String,
      required: true,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    channel: {
      type: String,
      enum: ['sms', 'email'],
      default: 'sms',
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed'],
      default: 'queued',
    },
    errorMessage: {
      type: String,
    },
    relatedEntity: {
      type: {
        type: String,
        enum: ['student', 'installment', 'attendance', 'event', 'marks'],
      },
      id: { type: Schema.Types.ObjectId },
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ 'recipient.studentId': 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotificationDocument>('Notification', notificationSchema);
