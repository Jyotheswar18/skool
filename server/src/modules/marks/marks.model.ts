import mongoose, { Schema, Document } from 'mongoose';

export interface IMarksDocument extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  class: string;
  section: string;
  subject: string;
  examName: string;
  marksObtained: number;
  maxMarks: number;
  comments?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const marksSchema = new Schema<IMarksDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    examName: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks obtained cannot be negative'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      default: 100,
      min: [1, 'Maximum marks must be at least 1'],
    },
    comments: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up queries and ensure uniqueness
marksSchema.index({ class: 1, section: 1, subject: 1, examName: 1 });
marksSchema.index({ student: 1, examName: 1, subject: 1 }, { unique: true });

export const Marks = mongoose.model<IMarksDocument>('Marks', marksSchema);
