import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceDocument extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  class: string;
  section: string;
  date: Date;
  status: 'present' | 'absent' | 'late';
  markedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendanceDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
      uppercase: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceSchema.index({ class: 1, section: 1, date: 1 });
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

export const Attendance = mongoose.model<IAttendanceDocument>('Attendance', attendanceSchema);
