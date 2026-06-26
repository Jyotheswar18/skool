import mongoose, { Schema, Document } from 'mongoose';

export interface ISchoolConfigDocument extends Document {
  _id: mongoose.Types.ObjectId;
  schoolName: string;
  schoolLogo?: string;
  classes: string[];
  sections: string[];
  academicYear: string;
  sms: {
    provider: 'mock' | 'twilio';
    apiKey?: string;
    apiUrl?: string;
    senderNumber?: string;
    enabled: boolean;
  };
  feeReminder: {
    daysBeforeDue: number;
    sendOnDueDate: boolean;
    overdueFrequency: 'daily' | 'weekly';
  };
  attendanceAlert: {
    enabled: boolean;
    sendTime: string; // e.g. "10:00"
  };
  updatedAt: Date;
  createdAt: Date;
}

const schoolConfigSchema = new Schema<ISchoolConfigDocument>(
  {
    schoolName: {
      type: String,
      required: true,
      default: 'EduNest School',
      trim: true,
    },
    schoolLogo: {
      type: String,
      trim: true,
    },
    classes: {
      type: [String],
      default: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    },
    sections: {
      type: [String],
      default: ['A', 'B', 'C'],
    },
    academicYear: {
      type: String,
      required: true,
      default: '2026-27',
      trim: true,
    },

    sms: {
      provider: {
        type: String,
        enum: ['mock', 'twilio'],
        default: 'mock',
      },
      apiKey: {
        type: String,
      },
      apiUrl: {
        type: String,
      },
      senderNumber: {
        type: String,
      },
      enabled: {
        type: Boolean,
        default: false,
      },
    },
    feeReminder: {
      daysBeforeDue: {
        type: Number,
        default: 3,
      },
      sendOnDueDate: {
        type: Boolean,
        default: true,
      },
      overdueFrequency: {
        type: String,
        enum: ['daily', 'weekly'],
        default: 'weekly',
      },
    },
    attendanceAlert: {
      enabled: {
        type: Boolean,
        default: false,
      },
      sendTime: {
        type: String,
        default: '10:00',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const SchoolConfig = mongoose.model<ISchoolConfigDocument>('SchoolConfig', schoolConfigSchema);
